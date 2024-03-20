import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMainContext } from "../provider";
import { QuoteResponse, Token } from "../type";
import {
  useGlobalStore,
  useLiquidityHubPersistedStore,
  useSwapState,
} from "../store/main";
import {
  EMPTY_QUOTE_RESPONSE,
  QUERY_KEYS,
  QUOTE_ERRORS,
  zeroAddress,
} from "../config/consts";
import { useShallow } from "zustand/react/shallow";
import { useChainConfig } from "./useChainConfig";
import { useIsDisabled } from "./useIsDisabled";
import {
  addSlippage,
  amountUi,
  counter,
  eqIgnoreCase,
  isNativeAddress,
  shouldReturnZeroOutAmount,
} from "../util";
import { useApiUrl } from "./useApiUrl";
import { swapAnalytics } from "../analytics";
import BN from "bignumber.js";
import _ from "lodash";
const useNormalizeAddresses = (fromToken?: Token, toToken?: Token) => {
  const wTokenAddress = useChainConfig()?.wToken?.address;

  return useMemo(() => {
    return {
      fromAddress: isNativeAddress(fromToken?.address || "")
        ? wTokenAddress
        : fromToken?.address,
      toAddress: isNativeAddress(toToken?.address || "")
        ? zeroAddress
        : toToken?.address,
    };
  }, [fromToken?.address, toToken?.address]);
};

export const useQuote = () => {
  const liquidityHubEnabled = useLiquidityHubPersistedStore(
    (s) => s.liquidityHubEnabled
  );
  const { fromAmount, dexMinAmountOut, fromToken, toToken } = useSwapState(
    useShallow((s) => ({
      fromAmount: s.fromAmount,
      dexMinAmountOut: s.dexMinAmountOut,
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const {
    account,
    chainId: connectedChainId,
    partner,
    quoteInterval,
    slippage,
    supportedChains,
  } = useMainContext();
  const apiUrl = useApiUrl();
  const showConfirmation = useSwapState(useShallow((s) => s.showConfirmation));
  const disabled = useIsDisabled();
  const { sessionId, setSessionId } = useGlobalStore();
  const { fromAddress, toAddress } = useNormalizeAddresses(fromToken, toToken);

  const isUnwrap =
    eqIgnoreCase(wTokenAddress || "", fromToken?.address || "") &&
    isNativeAddress(toToken?.address || "");

  const chainId = connectedChainId || _.first(supportedChains);

  const enabled =
    !isUnwrap &&
    !!partner &&
    !!chainId &&
    !!fromToken &&
    !!toToken &&
    !!fromAmount &&
    fromAmount !== "0" &&
    liquidityHubEnabled &&
    !!apiUrl &&
    !disabled;

  return useQuery({
    queryKey: [
      QUERY_KEYS.QUOTE,
      fromAddress,
      toAddress,
      fromAmount,
      slippage,
      apiUrl,
      chainId,
    ],
    queryFn: async ({ signal }) => {
      swapAnalytics.onQuoteRequest();
      let quote;
      const count = counter();

      try {
        const response = await fetch(`${apiUrl}/quote?chainId=${chainId}`, {
          method: "POST",
          body: JSON.stringify({
            inToken: fromAddress,
            outToken: toAddress,
            inAmount: fromAmount,
            outAmount: !dexMinAmountOut
              ? "-1"
              : new BN(dexMinAmountOut).gt(0)
              ? dexMinAmountOut
              : "0",
            user: account || zeroAddress,
            slippage,
            qs: encodeURIComponent(
              window.location.hash || window.location.search
            ),
            partner: partner.toLowerCase(),
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
        const outAmountUIWithSlippage = amountUi(
          toToken?.decimals,
          new BN(addSlippage(quote.outAmount, slippage))
        );
        const minAmountOut = parseInt(
          quote?.permitData.values.witness.outputs[1].startAmount.hex,
          16
        );
        return {
          ...quote,
          outAmountUI,
          outAmountUIWithSlippage,
          minAmountOut,
          minAmountOutUI: amountUi(toToken?.decimals, BN(minAmountOut || 0)),
          gasCostOutputToken: amountUi(
            toToken?.decimals,
            BN(
              parseInt(
                quote?.permitData.values.witness.outputs[0].startAmount.hex,
                16
              )
            )
          ),
        } as QuoteResponse;
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
    refetchInterval: (q) =>
      showConfirmation
        ? undefined
        : q.state.data?.disableInterval
        ? undefined
        : quoteInterval,
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
