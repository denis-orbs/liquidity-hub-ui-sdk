import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useQuote } from "./swap/useQuote";

function useAnalytics() {
  const slippage = useMainContext().slippage;
  const {
    fromToken,
    toToken,
    dexMinAmountOut,
    fromAmount,
    dexExpectedAmountOut,
  } = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      dexMinAmountOut: s.dexMinAmountOut,
      fromAmount: s.fromAmount,
      dexExpectedAmountOut: s.dexExpectedAmountOut,
    }))
  );

  const { data: quote } = useQuote();

  const quoteAmountOut = quote?.minAmountOut;
  const fromTokenUsd = quote?.inTokenUsd;
  const toTokenUsd = quote?.outTokenUsd;
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
