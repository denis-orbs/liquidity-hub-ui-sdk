import { useCallback, useEffect, useRef } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useLiquidityHubPersistedStore, useSwapState } from "../../store/main";
import { LH_CONTROL, UseLiquidityHubArgs } from "../../type";
import { Logger } from "../../util";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import useAnalytics from "../useAnalytics";
import { useAmountBN } from "../useAmountBN";
import { useDebounce } from "../useDebounce";

const useQuoteDelay = (
  fromAmount: string,
  dexExpectedAmountOut?: string,
  quoteDelayMillis?: number
) => {
  const quoteTimeoutRef = useRef<any>(null);
  const lhControl = useLiquidityHubPersistedStore((s) => s.lhControl);
  const { updateState, quoteEnabled } = useSwapState(
    useShallow((store) => ({
      updateState: store.updateState,
      quoteEnabled: store.quoteEnabled,
    }))
  );
  useEffect(() => {
    Logger({
      quoteEnabled,
      fromAmount,
      dexExpectedAmountOut,
      quoteDelayMillis,
    });
    clearTimeout(quoteTimeoutRef.current);
    if (quoteEnabled || BN(fromAmount).isZero()) return;
    if (!quoteDelayMillis || lhControl === LH_CONTROL.FORCE) {
      updateState({ quoteEnabled: true });
      return;
    }

    if (BN(dexExpectedAmountOut || "0").gt(0)) {
      Logger("got price from dex, enabling quote ");
      updateState({ quoteEnabled: true });
      clearTimeout(quoteTimeoutRef.current);
      return;
    }
    Logger("starting timeout to enable quote");
    quoteTimeoutRef.current = setTimeout(() => {
      updateState({ quoteEnabled: true });
    }, quoteDelayMillis);
  }, [
    dexExpectedAmountOut,
    quoteDelayMillis,
    quoteEnabled,
    updateState,
    fromAmount,
    lhControl,
  ]);
};


export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { swapStatus, swapError, updateState, showConfirmation } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
      swapError: store.swapError,
      updateState: store.updateState,
      showConfirmation: store.showConfirmation,
    }))
  );

  const _fromAmount = useAmountBN(args.fromToken?.decimals, args.fromAmount);
  const fromAmount = useDebounce(
    _fromAmount,
    _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );
  useQuoteDelay(fromAmount, args.expectedAmountOut, args.quoteDelayMillis);

  useEffect(() => {
    updateState({
      dexMinAmountOut: args.minAmountOut,
      dexExpectedAmountOut:args.expectedAmountOut,
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
    args.minAmountOut,
    args.expectedAmountOut,
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
    updateState({ showConfirmation: true });
  }, [updateState]);

  return {
    quote,
    confirmSwap,
    swapLoading: swapStatus === "loading",
    swapError,
    analyticsInit,
    isApproved,
  };
};