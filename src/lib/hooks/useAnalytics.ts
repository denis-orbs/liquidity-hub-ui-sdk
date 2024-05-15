import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useQuote } from "./swap/useQuote";
import { useUsdAmounts, useSlippage } from "./useSwapDetails";

export function useAnalytics() {
  const slippage = useSlippage();
  const { fromToken, toToken, dexMinAmountOut, fromAmount } = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      dexMinAmountOut: s.dexMinAmountOut,
      fromAmount: s.fromAmount,
    }))
  );

  const { data: quote } = useQuote();
  const { provider } = useMainContext();
  const quoteAmountOut = quote?.minAmountOut;
  const {inTokenUsdAmount, outTokenUsdAmount } = useUsdAmounts();
  const initTrade = useCallback(() => {
    swapAnalytics.onInitSwap({
      fromTokenUsdAmount: inTokenUsdAmount  ?parseFloat(inTokenUsdAmount) : 0,
      fromToken,
      toToken,
      dexMinAmountOut,
      toTokenUsdAmount: outTokenUsdAmount ? parseFloat(outTokenUsdAmount) : 0,
      srcAmount: fromAmount,
      slippage,
      tradeType: "BEST_TRADE",
      quoteAmountOut,
      provider,
    });
  }, [
    inTokenUsdAmount,
    fromToken,
    toToken,
    dexMinAmountOut,
    outTokenUsdAmount,
    fromAmount,
    slippage,
    quoteAmountOut,
    provider,
  ]);

  return {
    initTrade,
  };
}


