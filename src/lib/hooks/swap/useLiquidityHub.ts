import { useCallback, useEffect, useMemo } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import { useSwapState } from "../../store/main";
import { UseLiquidityHubArgs } from "../../type";
import { safeBN } from "../../util";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";

export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { swapStatus, swapError } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
      swapError: store.swapError,
    }))
  );

  const debouncedFromAmount = useDebounce(
    args.fromAmount,
    _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );

  const { fromAmount, dexMinAmountOut } = useMemo(() => {
    return {
      fromAmount: safeBN(debouncedFromAmount),
      dexMinAmountOut: safeBN(args.minAmountOut),
    };
  }, [debouncedFromAmount, args.minAmountOut]);

  useEffect(() => {
    useSwapState.getState().updateState({
      dexMinAmountOut,
      disabledByDex: args.disabled,
      slippage: args.slippage,
    });    
    if (!useSwapState.getState().showConfirmation) {
      useSwapState.getState().updateState({
        fromAmount,
        fromToken: args.fromToken,
        toToken: args.toToken,
      });
    }
  }, [
    dexMinAmountOut,
    args.disabled,
    args.slippage,
    fromAmount,
    args.fromToken?.address,
    args.toToken?.address,
  ]);

  const quote = useQuote();
  const isApproved = useAllowance().data;
  const analyticsInit = useAnalytics().initTrade;

  const confirmSwap = useCallback(() => {
    useSwapState.getState().updateState({ showConfirmation: true, originalQuote: quote.data });
  }, [quote.data]);

  return {
    quote,
    confirmSwap,
    swapLoading: swapStatus === "loading",
    swapError,
    analyticsInit,
    isApproved,
  };
};
