import { useQuery } from "@tanstack/react-query";
import { useMainContext } from "../provider";
import { QuoteResponse } from "../type";
import { useGlobalStore, useSwapState } from "../store/main";
import {
  EMPTY_QUOTE_RESPONSE,
  QUERY_KEYS,
  QUOTE_ERRORS,
  zeroAddress,
} from "../config/consts";
import { useChainConfig } from "./useChainConfig";
import { useIsDisabled } from "./useIsDisabled";
import {
  amountUi,
  counter,
  eqIgnoreCase,
  isNativeAddress,
  Logger,
  shouldReturnZeroOutAmount,
} from "../util";
import { useApiUrl } from "./useApiUrl";
import { swapAnalytics } from "../analytics";
import BN from "bignumber.js";
import _ from "lodash";
import { useHandleTokenAddresses } from "./useHandleTokenAddresses";

export const useQuote = () => {
  const store = useSwapState();
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const context = useMainContext();
  const apiUrl = useApiUrl();
  const disabled = useIsDisabled();
  const { sessionId, setSessionId } = useGlobalStore();
  const { fromAddress, toAddress } = useHandleTokenAddresses(
    store.fromToken,
    store.toToken
  );

  const isUnwrap =
    eqIgnoreCase(wTokenAddress || "", store.fromToken?.address || "") &&
    isNativeAddress(store.toToken?.address || "");

  const chainId = context.chainId || _.first(context.supportedChains);

  const enabled =
    !isUnwrap &&
    !!context.partner &&
    !!chainId &&
    !!store.fromToken &&
    !!store.toToken &&
    !!store.fromAmount &&
    BN(store.fromAmount || "0").gt(0) &&
    store.fromAmount !== "0" &&
    !!apiUrl &&
    !disabled &&
    store.quoteEnabled;

  return useQuery({
    queryKey: [
      QUERY_KEYS.QUOTE,
      fromAddress,
      toAddress,
      store.fromAmount,
      context.slippage,
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
            inAmount: store.fromAmount,
            outAmount: !store.dexMinAmountOut
              ? "-1"
              : new BN(store.dexMinAmountOut).gt(0)
              ? store.dexMinAmountOut
              : "0",
            user: context.account || zeroAddress,
            slippage: context.slippage,
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
          store.toToken?.decimals,
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

        const inAmountUsd = BN(quote.inTokenUsd || "")
          .times(
            amountUi(store.fromToken?.decimals, BN(store.fromAmount || "0"))
          )
          .toString();
        const outAmountUsd = BN(quote.outTokenUsd || "")
          .times(outAmountUI)
          .toString();

        

        const ui = {
          priceImpact: BN(outAmountUsd || "0")
            .div(inAmountUsd || "0")
            .minus(1)
            .times(100)
            .toString(),
          inAmountUsd,
          outAmountUsd,
          outAmount: outAmountUI,
          minAmountOut: amountUi(
            store.toToken?.decimals,
            BN(minAmountOut || 0)
          ),
          gasCostOutputToken: amountUi(
            store.toToken?.decimals,
            BN(gasCostOutputToken)
          ),
          gasCostUsd: amountUi(
            store.toToken?.decimals,
            BN(gasCostOutputToken).multipliedBy(quote.outTokenUsd || "0")
          ),
        };

        Logger({
          fromAmount: store.fromAmount,
          fromAddress,
          toAddress,  
          dexMinAmountOut: store.dexMinAmountOut,
          quote,
          minAmountOut,
          gasCostOutputToken,
          ui,
          refetchInterval:  context.quoteInterval
        });

        return {
          ...quote,
          minAmountOut,
          gasCostOutputToken,
          ui,
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
      store.showConfirmation
        ? undefined
        : q.state.data?.disableInterval
        ? undefined
        : context.quoteInterval,
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
