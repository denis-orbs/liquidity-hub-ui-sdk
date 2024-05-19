import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useQuote } from "./swap/useQuote";
import { useUsdAmounts, useSlippage } from "./useSwapDetails";
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
  const { inTokenUsdAmount, outTokenUsdAmount } = useUsdAmounts();

  const dexOutAmountWS = useMemo(() => {
    const slippageAmount = BN(dexMinAmountOut || "0").times(slippage / 100);
    return BN(dexMinAmountOut || "0")
      .plus(slippageAmount)
      .toString();
  }, [slippage, dexMinAmountOut]);

  const initTrade = useCallback(() => {
    swapAnalytics.onInitSwap({
      fromTokenUsdAmount: outTokenUsdAmount,
      fromToken,
      toToken,
      dexAmountOut: dexMinAmountOut,
      dexOutAmountWS,
      toTokenUsdAmount: outTokenUsdAmount,
      srcAmount: fromAmount,
      slippage,
      tradeType: "BEST_TRADE",
      quoteAmountOut,
      provider,
    });
  }, [
    dexOutAmountWS,
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
