import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMainContext } from "../../provider";
import { QuoteResponse } from "../../type";
import { useGlobalStore, useSwapState } from "../../store/main";
import {
  EMPTY_QUOTE_RESPONSE,
  QUERY_KEYS,
  QUOTE_ERRORS,
  zeroAddress,
} from "../../config/consts";
import { useIsDisabled } from "../useIsDisabled";
import {
  amountUi,
  counter,
  eqIgnoreCase,
  isNativeAddress,
  Logger,
  shouldReturnZeroOutAmount,
} from "../../util";
import { useApiUrl } from "./useApiUrl";
import { swapAnalytics } from "../../analytics";
import BN from "bignumber.js";
import _ from "lodash";
import { useChainConfig, useSlippage } from "..";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export const useQuote = () => {
  const {
    fromToken,
    toToken,
    fromAmount,
    quoteEnabled,
    dexMinAmountOut,
    swapStatus,
  } = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      fromAmount: s.fromAmount,
      quoteEnabled: s.quoteEnabled,
      dexMinAmountOut: s.dexMinAmountOut,
      swapStatus: s.swapStatus,
    }))
  );
  const context = useMainContext();
  const slippage = useSlippage();
  const apiUrl = useApiUrl();
  const disabled = useIsDisabled();
  const { sessionId, setSessionId } = useGlobalStore();

  const chainId = context.chainId || _.first(context.supportedChains);
  const wTokenAddress = useChainConfig()?.wToken?.address;

  const { isUnwrap, isWrap } = useMemo(() => {
    const isUnwrap =
      eqIgnoreCase(wTokenAddress || "", fromToken?.address || "") &&
      isNativeAddress(toToken?.address || "");

    const isWrap =
      eqIgnoreCase(wTokenAddress || "", toToken?.address || "") &&
      isNativeAddress(fromToken?.address || "");

    return { isUnwrap, isWrap };
  }, [fromToken, toToken, wTokenAddress]);

  const enabled =
    !!context.partner &&
    !!chainId &&
    !!fromToken &&
    !!toToken &&
    !!fromAmount &&
    BN(fromAmount || "0").gt(0);
  !!apiUrl && !disabled && quoteEnabled;
  const queryKey = [
    QUERY_KEYS.QUOTE,
    fromToken?.address,
    toToken?.address,
    fromAmount,
    slippage,
    apiUrl,
    chainId,
  ];
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      swapAnalytics.onQuoteRequest();
      let quote;
      const count = counter();
      if (isUnwrap || isWrap) {        
        const amount = amountUi(fromToken?.decimals, new BN(fromAmount || "0"));
        return {
          ...EMPTY_QUOTE_RESPONSE,
          outAmount: fromAmount!,
          ui: {
            minAmountOut: amount,
            outAmount: amount,
          },
        };
      }

      try {
        const response = await fetch(`${apiUrl}/quote?chainId=${chainId}`, {
          method: "POST",
          body: JSON.stringify({
            inToken: isNativeAddress(fromToken?.address || "")
              ? wTokenAddress
              : fromToken?.address,
            outToken: isNativeAddress(toToken?.address || "")
              ? zeroAddress
              : toToken?.address,
            inAmount: fromAmount,
            outAmount: _.isUndefined(dexMinAmountOut) ? "-1" : dexMinAmountOut,
            user: context.account || zeroAddress,
            slippage,
            qs: encodeURIComponent(
              window.location.hash || window.location.search
            ),
            partner: context.partner.toLowerCase(),
            sessionId,
          }),
          signal,
        });
        quote = await response.json();

        if (!quote) {
          throw new Error("No result");
        }

        if (quote.error) {
          throw new Error(quote.error);
        }

        if (!quote.outAmount || new BN(quote.outAmount).eq(0)) {
          throw new Error(QUOTE_ERRORS.noLiquidity);
        }
        swapAnalytics.onQuoteSuccess(count(), quote);

        const outAmountUI = amountUi(
          toToken?.decimals,
          new BN(quote.outAmount)
        );

        const minAmountOut = parseInt(
          quote?.permitData.values.witness.outputs[1].endAmount.hex,
          16
        );

        const gasCostOutputToken = parseInt(
          quote?.permitData.values.witness.outputs[0].startAmount.hex,
          16
        );

        const ui = {
          outAmount: outAmountUI,
          minAmountOut: amountUi(toToken?.decimals, BN(minAmountOut || 0)),
          gasCostOutputToken: amountUi(
            toToken?.decimals,
            BN(gasCostOutputToken)
          ),
        };

        Logger({
          fromAmount,
          fromAddress: fromToken?.address,
          toAddress: toToken?.address,
          dexMinAmountOut,
          quote,
          minAmountOut,
          gasCostOutputToken,
          ui,
          refetchInterval: context.quoteInterval,
        });
        const res = {
          ...quote,
          minAmountOut,
          gasCostOutputToken,
          ui,
        } as QuoteResponse;
        res.refetchCount =
          ((queryClient.getQueryData(queryKey) as QuoteResponse)
            ?.refetchCount || 0) + 1;

        return res;
      } catch (error: any) {
        swapAnalytics.onQuoteFailed(error.message, count(), quote);

        if (shouldReturnZeroOutAmount(error.message) || signal.aborted) {
          return EMPTY_QUOTE_RESPONSE;
        } else {
          throw new Error(error.message);
        }
      } finally {
        if (quote.sessionId) {
          setSessionId(quote.sessionId);
        }
      }
    },
    refetchInterval: ({ state }) => {
      const quoteInterval = context.quoteInterval || 10_000;
      if (state.data?.disableInterval || swapStatus) {
        return undefined;
      }
      const refetchCount = state.data?.refetchCount || 0;
      if (refetchCount > (context.quoteRefetchUntilThrottle || 6)) {
        return (refetchCount * quoteInterval) / 2;
      }
      return context.quoteInterval;
    },
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
