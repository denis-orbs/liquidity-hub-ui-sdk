import { useCallback, useEffect, useRef } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useLiquidityHubPersistedStore, useSwapState } from "../../store/main";
import { LH_CONTROL, UseLiquidityHubArgs } from "../../type";
import { Logger } from "../../util";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";

const useQuoteDelay = (
  fromAmount: string,
  dexMinAmountOut?: string,
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
      dexMinAmountOut,
      quoteDelayMillis,
    });
    clearTimeout(quoteTimeoutRef.current);
    if (quoteEnabled || BN(fromAmount).isZero()) return;
    if (!quoteDelayMillis || lhControl === LH_CONTROL.FORCE) {
      updateState({ quoteEnabled: true });
      return;
    }

    if (BN(dexMinAmountOut || "0").gt(0)) {
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
    dexMinAmountOut,
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

  const fromAmount = useDebounce(
    args.fromAmount,
    _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );
  useQuoteDelay(
    args.fromAmount || "0",
    args.minAmountOut,
    args.quoteDelayMillis
  );

  useEffect(() => {
    updateState({
      disabledByDex: args.disabled,
      slippage: args.slippage,
    });
  }, [
    updateState,
    args.minAmountOut,
    args.disabled,
    args.slippage,
    showConfirmation,
    fromAmount,
    args.fromToken?.address,
    args.toToken?.address,
    args.inTokenUsd,
    args.outTokenUsd,
  ]);

  const quote = useQuote({
    fromAmount,
    fromToken: args.fromToken,
    toToken: args.toToken,
    disabledByDex: args.disabled,
    dexMinAmountOut: args.minAmountOut,
  });
  const isApproved = useAllowance({fromAmount, fromToken: args.fromToken, toToken: args.toToken}).data;
  const analyticsInit = useAnalytics({
    fromAmount,
    fromToken: args.fromToken,
    toToken: args.toToken,
  }).initTrade;

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
