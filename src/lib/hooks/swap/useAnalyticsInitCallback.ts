import { useCallback } from "react";
import { swapAnalytics } from "../../analytics";
import BN from "bignumber.js";
import { useMainContext } from "../../context/MainContext";
import { Quote, Token } from "../../type";

export function useAnalyticsInitCallback() {
  const {
    provider,
    state: { sessionId, slippage },
  } = useMainContext();

  return  useCallback(
    (args: {
      fromAmount?: string;
      fromToken?: Token;
      toToken?: Token;
      dexMinAmountOut?: string;
      quote?: Quote;
    }) => {
      const { fromToken, toToken, fromAmount, dexMinAmountOut, quote } = args;
      const getDexOutAmountWS = (
        dexMinAmountOut?: string,
        slippage?: number
      ) => {
        const slippageAmount = !slippage
          ? 0
          : BN(dexMinAmountOut || "0").times(slippage / 100);
        return BN(dexMinAmountOut || "0")
          .plus(slippageAmount)
          .toString();
      };
      swapAnalytics.onInitSwap({
        fromToken,
        toToken,
        dexAmountOut: dexMinAmountOut,
        dexOutAmountWS: getDexOutAmountWS(dexMinAmountOut, slippage),
        srcAmount: fromAmount,
        slippage,
        tradeType: "BEST_TRADE",
        quoteAmountOut: quote?.outAmount,
        provider,
        sessionId,
      });
    },
    [slippage, provider, sessionId]
  );


}
