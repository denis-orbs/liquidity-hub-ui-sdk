import { useCallback, useMemo } from "react";
import { swapAnalytics } from "../analytics";
import BN from "bignumber.js";
import { useMainContext } from "../context/MainContext";
import { useGetQuoteQuery } from "./swap/useGetQuoteQuery";
export function useAnalytics() {
  const getQuoteQuery = useGetQuoteQuery();

  const { provider, state } = useMainContext();

  const {
    sessionId,
    slippage,
    fromAmount,
    dexMinAmountOut,
    fromToken,
    toToken,
  } = state;

  const dexOutAmountWS = useMemo(() => {
    const slippageAmount = !slippage
      ? 0
      : BN(dexMinAmountOut || "0").times(slippage / 100);
    return BN(dexMinAmountOut || "0")
      .plus(slippageAmount)
      .toString();
  }, [slippage, dexMinAmountOut]);

  const initTrade = useCallback(() => {
    const query = getQuoteQuery()?.data;
    swapAnalytics.onInitSwap({
      fromToken,
      toToken,
      dexAmountOut: dexMinAmountOut,
      dexOutAmountWS,
      srcAmount: fromAmount,
      slippage,
      tradeType: "BEST_TRADE",
      quoteAmountOut: query?.quoteResponse.quote?.outAmount,
      provider,
      sessionId,
    });
  }, [
    dexOutAmountWS,
    fromToken,
    toToken,
    dexMinAmountOut,
    fromAmount,
    slippage,
    provider,
    sessionId,
    getQuoteQuery,
  ]);

  return {
    initTrade,
  };
}
