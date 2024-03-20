import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useQuote } from "./useQuote";

function useAnalytics() {
  const slippage = useMainContext().slippage;
  const {
    fromTokenUsd,
    fromToken,
    toToken,
    dexMinAmountOut,
    toTokenUsd,
    fromAmount,
    dexExpectedAmountOut,
  } = useSwapState(
    useShallow((s) => ({
      fromTokenUsd: s.fromTokenUsd,
      fromToken: s.fromToken,
      toToken: s.toToken,
      dexMinAmountOut: s.dexMinAmountOut,
      toTokenUsd: s.toTokenUsd,
      fromAmount: s.fromAmount,
      dexExpectedAmountOut: s.dexExpectedAmountOut,
    }))
  );

  const quoteAmountOut = useQuote().data?.minAmountOut;

  const initTrade = useCallback(() => {
    swapAnalytics.onInitSwap({
      fromTokenUsd,
      fromToken,
      toToken,
      dexMinAmountOut,
      toTokenUsd,
      srcAmount: fromAmount,
      slippage,
      tradeType: "BEST_TRADE",
      quoteAmountOut,
      dexExpectedAmountOut,
    });
  }, [
    fromTokenUsd,
    fromToken,
    toToken,
    dexMinAmountOut,
    toTokenUsd,
    fromAmount,
    slippage,
    quoteAmountOut,
    dexExpectedAmountOut,
  ]);

  return {
    initTrade,
  };
}

export default useAnalytics;
