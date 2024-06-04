import { useCallback, useMemo } from "react";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import BN from "bignumber.js";
import { QuoteResponse, Token } from "..";
export function useAnalytics({
  fromToken,
  toToken,
  dexMinAmountOut,
  fromAmount,
  quote,
  slippage
}: {
  fromToken?: Token;
  toToken?: Token;
  dexMinAmountOut?: string;
  fromAmount?: string;
  quote?: QuoteResponse,
  slippage: number;
}) {


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
