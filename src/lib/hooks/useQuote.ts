import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMainContext } from "../provider";
import { QuoteQueryArgs, QuoteResponse, Token } from "../type";
import { useLiquidityHubPersistedStore, useSwapState } from "../store/main";
import { QUERY_KEYS, QUOTE_ERRORS, zeroAddress } from "../config/consts";
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
import { numericFormatter } from "react-number-format";
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

export const useQuote = (args: QuoteQueryArgs) => {
  const liquidityHubEnabled = useLiquidityHubPersistedStore(
    (s) => s.liquidityHubEnabled
  );
  const { fromAmount, dexAmountOut, fromToken, toToken } = args;
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const { account, chainId, partner, quoteInterval, slippage } =
    useMainContext();
  const apiUrl = useApiUrl();

  const showConfirmation = useSwapState(useShallow((s) => s.showConfirmation));
  const disabled = useIsDisabled();

  const { fromAddress, toAddress } = useNormalizeAddresses(fromToken, toToken);

  const isUnwrap =
    eqIgnoreCase(wTokenAddress || "", fromToken?.address || "") &&
    isNativeAddress(toToken?.address || "");

  const enabled =
    !isUnwrap &&
    !!partner &&
    !!chainId &&
    !!account &&
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
      account,
      apiUrl,
    ],
    queryFn: async ({ signal }) => {
      swapAnalytics.onQuoteRequest();
      let quote;
      let timeout;
      const count = counter();
      try {
        timeout = setTimeout(() => {
          throw new Error(QUOTE_ERRORS.timeout);
        }, 10_000);
        const response = await fetch(`${apiUrl}/quote?chainId=${chainId}`, {
          method: "POST",
          body: JSON.stringify({
            inToken: fromAddress,
            outToken: toAddress,
            inAmount: fromAmount,
            outAmount: !dexAmountOut
              ? "-1"
              : new BN(dexAmountOut).gt(0)
              ? dexAmountOut
              : "0",
            user: account,
            slippage,
            qs: encodeURIComponent(
              window.location.hash || window.location.search
            ),
            partner: partner.toLowerCase(),
            sessionId: swapAnalytics.data.sessionId,
          }),
          signal,
        });
        quote = await response.json();
        let gasCostOutputToken = "0";
        try {
          gasCostOutputToken = amountUi(
            toToken?.decimals,
            BN(
              parseInt(
                quote?.permitData.values.witness.outputs[0].startAmount.hex,
                16
              )
            )
          );
        } catch (error) {}
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

        const outAmountUI = numericFormatter(
          amountUi(toToken?.decimals, new BN(quote.outAmount)),
          { decimalScale: 4, thousandSeparator: "," }
        );

        const outAmountUIWithSlippage = numericFormatter(
          amountUi(
            toToken?.decimals,
            new BN(addSlippage(quote.outAmount, slippage))
          ),
          { decimalScale: 4, thousandSeparator: "," }
        );
        return {
          ...quote,
          outAmountUI,
          outAmountUIWithSlippage,
          gasCostOutputToken
        } as QuoteResponse;
      } catch (error: any) {
        swapAnalytics.onQuoteFailed(error.message, count(), quote);

        if (shouldReturnZeroOutAmount(error.message) || signal.aborted) {
          return {
            outAmount: "0",
            outAmountUI: "0",
            disableInterval: true,
          } as QuoteResponse;
        } else {
          throw new Error(error.message);
        }
      } finally {
        clearTimeout(timeout);

        if (quote.sessionId) {
          swapAnalytics.setSessionId(quote.sessionId);
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
