import { useCallback, useEffect, useMemo } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import { useSwapState } from "../../store/main";
import {  UseLiquidityHubArgs } from "../../type";
import { safeBN } from "../../util";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";


export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { swapStatus, swapError, updateState, showConfirmation } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
      swapError: store.swapError,
      updateState: store.updateState,
      showConfirmation: store.showConfirmation,
    }))
  );

  const debouncedFromAmount = useDebounce(
    args.fromAmount,
    _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );

  const fromAmount = useMemo(
    () => safeBN(debouncedFromAmount),
    [debouncedFromAmount]
  );
  const dexMinAmountOut = useMemo(
    () => safeBN(args.minAmountOut),
    [args.minAmountOut]
  );

  useEffect(() => {    
    updateState({
      dexMinAmountOut,
      disabledByDex: args.disabled,
      slippage: args.slippage,
    });
    if (!showConfirmation) {
      updateState({
        fromAmount,
        fromToken: args.fromToken,
        toToken: args.toToken,
      });
    }
  }, [
    updateState,
    dexMinAmountOut,
    args.disabled,
    args.slippage,
    showConfirmation,
    fromAmount,
    args.fromToken?.address,
    args.toToken?.address,
  ]);

  const quote = useQuote();
  const isApproved = useAllowance().data;
  const analyticsInit = useAnalytics().initTrade;

  const confirmSwap = useCallback(() => {
    updateState({ showConfirmation: true, originalQuote: quote.data });
  }, [updateState, quote.data]);

  return {
    quote,
    confirmSwap,
    swapLoading: swapStatus === "loading",
    swapError,
    analyticsInit,
    isApproved,
  };
};
