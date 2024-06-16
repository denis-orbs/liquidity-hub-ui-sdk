import { useCallback, useMemo, useState } from "react";
import BN from "bignumber.js";
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
import { useMainContext } from "../../provider";

export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const [state, setState] = useState({} as UseLiquidityHubState);
  const refetchInterval = useMainContext().quote?.refetchInterval;
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

  const resetState = useCallback(() => {
    setTimeout(() => {
      setState(
        (prev) =>
          ({
            failures: prev.failures || 0,
            sessionId: prev.sessionId,
          } as UseLiquidityHubState)
      );
    }, 3_00);
  }, [setState]);

  const quoteQuery = useQuote({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    swapStatus: state.swapStatus,
    showConfirmation: state.showConfirmation,
    disabled,
    slippage,
    sessionId: state.sessionId,
    updateState,
  });

  const analyticsInit = useAnalytics({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    quote: quoteQuery.data?.quote,
    slippage,
    sessionId: state.sessionId,
  }).initTrade;

  const onShowConfirmation = useCallback(() => {
    updateState({
      showConfirmation: true,
      initialQuote: state.initialQuote || quoteQuery.data?.quote,
    });
    quoteQuery.data?.resetCount();

    if (quoteQuery.data?.isPassedLimit) {
      quoteQuery.refetch();
    }
  }, [
    quoteQuery.refetch,
    quoteQuery.data,
    updateState,
    state.initialQuote,
    refetchInterval,
  ]);

  const {
    mutateAsync: submitSwap,
    error: swapError,
    reset: resetSubmitSwap,
  } = useSubmitSwap({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    updateState,
    quote: quoteQuery.data?.quote,
    sessionId: state.sessionId,
    failures: state.failures,
  });

  const onClose = useCallback(() => {
    updateState({
      showConfirmation: false,
    });
    if (state.swapStatus === "loading") return;
    if (!state.swapStatus) resetSubmitSwap();

    if (state.swapStatus === "failed" || state.swapStatus === "success") {
      // refetch quote to get new session id
      quoteQuery.refetch();
    }
    resetState();
  }, [
    state.swapStatus,
    updateState,
    setState,
    quoteQuery.refetch,
    resetSubmitSwap,
    resetState,
    state.isWrapped,
  ]);

  return {
    quote: !state.sessionId ? undefined : quoteQuery.data?.quote,
    quoteLoading: quoteQuery.isLoading,
    quoteError: quoteQuery.error,
    initialQuote: state.initialQuote,
    txHash: state.txHash,
    approvalTxHash: state.approveTxHash,
    wrapTxHash: state.wrapTxHash,
    swapError,
    swapLoading: state.swapStatus === "loading",
    swapSuccess: state.swapStatus === "success",
    swapStatus: state.swapStatus,
    fromToken: args.fromToken,
    toToken: args.toToken,
    showConfirmationModal: !!state.showConfirmation,
    currentStep: state.currentStep,
    isWrapped: !!state.isWrapped,
    fromAmount,
    ui: {
      fromAmount: useAmountUI(args.fromToken?.decimals, fromAmount),
      minAmountOut: useAmountUI(
        args.toToken?.decimals,
        quoteQuery.data?.quote.minAmountOut
      ),
      outAmount: useAmountUI(
        args.toToken?.decimals,
        quoteQuery.data?.quote?.outAmount
      ),
      gasAmountOut: useAmountUI(
        args.toToken?.decimals,
        quoteQuery.data?.quote.gasAmountOut
      ),
    },
    isSigned: state.isSigned,
    isDisabled: disabled,
    onShowConfirmation,
    closeConfirmationModal: onClose,
    submitSwap,
    analyticsInit,
  };
};
