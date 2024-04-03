import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useLiquidityHubPersistedStore, useSwapState } from "../store/main";
import { LH_CONTROL, UseLiquidityHubArgs } from "../type";
import { amountBN, Logger } from "../util";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import useAnalytics from "./useAnalytics";
import { useAmountBN } from "./useAmountBN";
import { useDebounce } from "./useDebounce";

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
    lhControl
  ]);
};

const useDexMinAmountOutWei = (args: UseLiquidityHubArgs) => {
  return useMemo(() => {
    if ((!args.minAmountOut && !args.minAmountOutUI) || !args.toToken) {
      return undefined;
    }
    const value = args.minAmountOut
      ? args.minAmountOut
      : amountBN(args.toToken.decimals, args.minAmountOutUI || "0").toString();
    return BN(value).decimalPlaces(0).toString();
  }, [args.minAmountOutUI, args.minAmountOutUI, args.toToken]);
};

const useDexExpectedAmountOutWei = (args: UseLiquidityHubArgs) => {
  return useMemo(() => {
    if (
      (!args.expectedAmountOut && !args.expectedAmountOutUI) ||
      !args.toToken
    ) {
      return undefined;
    }
    const value = args.expectedAmountOut
      ? args.expectedAmountOut
      : amountBN(
          args.toToken.decimals,
          args.expectedAmountOutUI || "0"
        ).toString();
    return BN(value).decimalPlaces(0).toString();
  }, [args.expectedAmountOutUI, args.expectedAmountOutUI, args.toToken]);
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
      ? 3_00
      : args.debounceFromAmountMillis
  );
  const dexMinAmountOut = useDexMinAmountOutWei(args);
  const dexExpectedAmountOut = useDexExpectedAmountOutWei(args);
  useQuoteDelay(fromAmount, dexExpectedAmountOut, args.quoteDelayMillis);
  useEffect(() => {
    updateState({
      dexMinAmountOut,
      dexExpectedAmountOut,
      disabledByDex: args.disabled,
    });
    // we dont want the dex to reset after success
    if (!showConfirmation) {
      updateState({
        fromAmount,
        fromToken: args.fromToken,
        toToken: args.toToken,
      });
    }
  }, [
    updateState,
    fromAmount,
    dexMinAmountOut,
    dexExpectedAmountOut,
    args.fromToken?.address,
    args.toToken?.address,
    args.disabled,
    showConfirmation,
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
