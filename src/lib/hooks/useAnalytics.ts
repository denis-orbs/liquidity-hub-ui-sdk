import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useQuote } from "./swap/useQuote";
import {useSlippage } from "./useSwapDetails";
import BN from "bignumber.js";
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

  const dexOutAmountWS = useMemo(() => {
    const slippageAmount = BN(dexMinAmountOut || "0").times(slippage / 100);
    return BN(dexMinAmountOut || "0")
      .plus(slippageAmount)
      .toString();
  }, [slippage, dexMinAmountOut]);

  const initTrade = useCallback(() => {
    swapAnalytics.onInitSwap({
      fromToken,
      toToken,
      dexAmountOut: dexMinAmountOut,
      dexOutAmountWS,
      srcAmount: fromAmount,
      slippage,
      tradeType: "BEST_TRADE",
      quoteAmountOut,
      provider,
    });
  }, [
    dexOutAmountWS,
    fromToken,
    toToken,
    dexMinAmountOut,
    fromAmount,
    slippage,
    quoteAmountOut,
    provider,
  ]);

  return {
    initTrade,
  };
}
