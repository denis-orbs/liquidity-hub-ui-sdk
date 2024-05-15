import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMainContext } from "../../provider";
import { QuoteResponse, Token } from "../../type";
import { useGlobalStore, useSwapState } from "../../store/main";
import {
  EMPTY_QUOTE_RESPONSE,
  QUERY_KEYS,
  QUOTE_ERRORS,
  zeroAddress,
} from "../../config/consts";
import { useChainConfig } from "../useChainConfig";
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
import { useHandleTokenAddresses } from "../useHandleTokenAddresses";
import { useSlippage } from "..";

export const useQuote = ({
  fromToken,
  toToken,
  fromAmount,
  dexMinAmountOut,
  disabledByDex
}: {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  dexMinAmountOut?: string;
  disabledByDex?: boolean;
}) => {
  const store = useSwapState();
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const context = useMainContext();
  const slippage = useSlippage()
  const apiUrl = useApiUrl();
  const disabled = useIsDisabled(disabledByDex);
  const { sessionId, setSessionId } = useGlobalStore();
  const { fromAddress, toAddress } = useHandleTokenAddresses(
    fromToken,
    toToken
  );

  const isUnwrap =
    eqIgnoreCase(wTokenAddress || "", fromToken?.address || "") &&
    isNativeAddress(toToken?.address || "");

  const chainId = context.chainId || _.first(context.supportedChains);

  const enabled =
    !isUnwrap &&
    !!context.partner &&
    !!chainId &&
    !!fromToken &&
    !!toToken &&
    !!fromAmount &&
    BN(fromAmount || "0").gt(0) &&
    fromAmount !== "0" &&
    !!apiUrl &&
    !disabled &&
    store.quoteEnabled;
    const queryKey = [
      QUERY_KEYS.QUOTE,
      fromAddress,
      toAddress,
      fromAmount,
      slippage,
      apiUrl,
      chainId,
    ]
    const queryClient = useQueryClient();
  return useQuery({
    queryKey,
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
            outAmount: !dexMinAmountOut || BN(dexMinAmountOut || '0').isZero() 
              ? "-1"
              : new BN(dexMinAmountOut).gt(0)
              ? dexMinAmountOut
              : "0",
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
          minAmountOut: amountUi(
            toToken?.decimals,
            BN(minAmountOut || 0)
          ),
          gasCostOutputToken: amountUi(
            toToken?.decimals,
            BN(gasCostOutputToken)
          ),
        };

        Logger({
          fromAmount: fromAmount,
          fromAddress,
          toAddress,
          dexMinAmountOut: dexMinAmountOut,
          quote,
          minAmountOut,
          gasCostOutputToken,
          ui,
          refetchInterval: context.quoteInterval,
        });
        const res =  {
          ...quote,
          minAmountOut,
          gasCostOutputToken,
          ui,
        } as QuoteResponse;
        res.refetchCount = ((queryClient.getQueryData(queryKey) as QuoteResponse)?.refetchCount || 0) + 1

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
      const quoteInterval = context.quoteInterval || 10_000
      if(state.data?.disableInterval || store.swapStatus) {
        return undefined
      }
      const refetchCount = state.data?.refetchCount || 0
      if (refetchCount > 6) {
        return refetchCount * quoteInterval / 2
      }
      return context.quoteInterval
    },
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
