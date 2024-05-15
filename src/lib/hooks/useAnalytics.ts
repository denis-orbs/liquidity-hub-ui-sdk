import { useCallback } from "react";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { Token } from "../type";
import { useSlippage } from "./useSwapDetails";

export function useAnalytics({
  fromToken,
  toToken,
  dexMinAmountOut,
  fromAmount,
  outTokenUsdAmount,
  inTokenUsdAmount,
  quoteAmountOut,
}: {
  fromToken?: Token;
  toToken?: Token;
  dexMinAmountOut?: string;
  fromAmount?: string;
  inTokenUsdAmount?: string;
  outTokenUsdAmount?: string;
  quoteAmountOut?: string;
}) {
  const slippage = useSlippage();

  const { provider } = useMainContext();
  const initTrade = useCallback(() => {
    swapAnalytics.onInitSwap({
      fromTokenUsdAmount: inTokenUsdAmount ? parseFloat(inTokenUsdAmount) : 0,
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
