import { useCallback } from "react";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { Token } from "../type";

export interface InitTrade {
  quoteAmountOut?: string;
  dexMinAmountOut?: string;
  dexExpectedAmountOut?: string;
  fromAmount?: string;
  fromToken?: Token;
  toToken?: Token;
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
}

function useAnalytics() {
  const slippage = useMainContext().slippage;

  const initTrade = useCallback(
    (args: InitTrade) => {
      swapAnalytics.onInitSwap({
        fromTokenUsd: args.fromTokenUsd,
        fromToken: args.fromToken,
        toToken: args.toToken,
        dexMinAmountOut: args.dexMinAmountOut,
        dstTokenUsdValue: args.toTokenUsd,
        srcTokenUsdValue: args.fromTokenUsd,
        srcAmount: args.fromAmount,
        slippage,
        tradeType: "BEST_TRADE",
        quoteAmountOut: args.quoteAmountOut,
        dexExpectedAmountOut: args.dexExpectedAmountOut,
      });
    },
    [slippage]
  );

  return {
    initTrade,
  };
}

export default useAnalytics;
