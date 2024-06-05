import { useCallback, useMemo, useState } from "react";
import { useQuote } from "./useQuote";
import { UseLiquidityHubArgs } from "../../type";
import { safeBN } from "../../util";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";
import {
  useAmountUI,
  useIsDisabled,
  UseLiquidityHubState,
  useSubmitSwap,
} from "../..";
import BN from "bignumber.js";
export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const [state, setState] = useState({} as UseLiquidityHubState);

  const debouncedFromAmount = useDebounce(
    args.fromAmount,
    BN(args.fromAmount || 0).isZero()
      ? 0
      : _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );
  const disabled = useIsDisabled({
    failures: state.failures,
    disabledByDex: args.disabled,
  });

  const slippage = useMemo(() => {
    if (!args.slippage) return 0;
    return BN(args.slippage).isNaN() ? 0 : args.slippage;
  }, [args.slippage]);

  const { fromAmount, dexMinAmountOut } = useMemo(() => {
    return {
      fromAmount: safeBN(debouncedFromAmount),
      dexMinAmountOut: safeBN(args.minAmountOut),
    };
  }, [debouncedFromAmount, args.minAmountOut]);

  const updateState = useCallback(
    (newState: Partial<UseLiquidityHubState>) => {
      setState((prevState) => ({ ...prevState, ...newState }));
    },

    [setState]
  );

  const setSessionId = useCallback(
    (sessionId: string) => {
      updateState({ sessionId });
    },
    [updateState]
  );

  const resetState = useCallback(() => {
   setTimeout(() => {
    setState(
      (prev) => ({ failures: prev.failures || 0 } as UseLiquidityHubState),
    );
   }, 3_00);
  }, [setState]);

  const onSwapFailed = useCallback(() => {
    updateState({
      swapStatus: "failed",
      sessionId: undefined,
      currentStep: undefined,
      failures: (state.failures || 0) + 1,
    });
  }, [updateState, state.failures]);

  const quote = useQuote({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    swapStatus: state.swapStatus,
    showConfirmation: state.showConfirmation,
    disabled,
    slippage,
    sessionId: state.sessionId,
    setSessionId,
  });

  const analyticsInit = useAnalytics({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    quote: quote.data,
    slippage,
    sessionId: state.sessionId,
  }).initTrade;

  const onShowConfirmation = useCallback(() => {
    updateState({
      showConfirmation: true,
      originalQuote: state.originalQuote || quote.data,
    });
  }, [quote.data, updateState, state.originalQuote]);

  const {
    mutateAsync: submitSwap,
    isPending: swapLoading,
    error: swapError,
    reset: resetSubmitSwap,
  } = useSubmitSwap({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    updateState,
    quote: quote.data,
    onSwapFailed,
  });

  const onClose = useCallback(() => {
    updateState({
      showConfirmation: false,
    });
    if (!state.swapStatus) {
      resetSubmitSwap();
    }
    if (state.swapStatus === "failed") {
      // refetch quote to get new session id
      quote.refetch();
    }
    switch (state.swapStatus) {
      case undefined:
      case "failed":
      case "success":
        resetState();
    }
  }, [
    state.swapStatus,
    updateState,
    setState,
    quote.refetch,
    resetSubmitSwap,
    resetState,
  ]);

  return {
    quote,
    originalQuote: state.originalQuote,
    txHash: state.txHash,
    swapError,
    swapLoading,
    swapStatus: state.swapStatus,
    fromToken: args.fromToken,
    toToken: args.toToken,
    showConfirmationModal: !!state.showConfirmation,
    currentStep: state.currentStep,
    isWrapped: !!state.isWrapped,
    fromAmount,
    fromAmountUi: useAmountUI(args.fromToken?.decimals, fromAmount),
    outAmountUi: useAmountUI(args.toToken?.decimals, quote.data?.outAmount),
    gasAmountOutUi: useAmountUI(
      args.toToken?.decimals,
      quote.data?.gasAmountOut
    ),
    isSigned: state.isSigned,
    isDisabled: disabled,
    onShowConfirmation,
    closeConfirmationModal: onClose,
    submitSwap,
    analyticsInit,
  };
};
