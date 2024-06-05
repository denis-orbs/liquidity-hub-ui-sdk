import { useCallback, useMemo, useState } from "react";
import { useAllowance } from "./useAllowance";
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
  usePriceChanged,
  useSubmitSwap,
  useSwapRoute,
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

  const quote = useQuote({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    swapStatus: state.swapStatus,
    showConfirmation: state.showConfirmation,
    disabled,
    slippage,
    setSessionId,
    sessionId: state.sessionId,
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
  });

  const priceChangeWarning = usePriceChanged({
    quote: quote.data,
    originalQuote: state.originalQuote,
    swapStatus: state.swapStatus,
    showConfirmation: state.showConfirmation,
    toToken: args.toToken,
  });

  const onClose = useCallback(
    (timeout = 300) => {
      updateState({
        showConfirmation: false,
      });
      if (!state.swapStatus) {
        updateState({
          originalQuote: undefined,
        });
      }
      if (state.swapStatus === "success") {
        setTimeout(() => {
          setState({} as UseLiquidityHubState);
        }, timeout);
      }
      if (state.swapStatus === "failed") {
        // refetch quote to get new session id
        quote.refetch();
        resetSubmitSwap();
        setTimeout(() => {
          setState(
            (prev) =>
              ({ failures: (prev.failures || 0) + 1 } as UseLiquidityHubState)
          );
        }, timeout);
      }
    },
    [state.swapStatus, updateState, setState, quote.refetch, resetSubmitSwap]
  );

  const { data: hasAllowance, isLoading: allowanceLoading } = useAllowance(
    args.fromToken?.address,
    fromAmount
  );

  return {
    quote,
    txHash: state.txHash,
    onShowConfirmation,
    swapError,
    analyticsInit,
    getSwapRoute: useSwapRoute(disabled),
    swapStatus: state.swapStatus,
    submitSwap,
    priceChangeWarning,
    swapLoading,
    fromToken: args.fromToken,
    toToken: args.toToken,
    isOpen: state.showConfirmation,
    onClose,
    currentStep: state.currentStep,
    isNativeIn: state.isNativeIn,
    fromAmount,
    outAmount: quote.data?.outAmount,
    fromAmountUi: useAmountUI(args.fromToken?.decimals, fromAmount),
    outAmountUi: quote.data?.ui.outAmount,
    hasAllowance,
    allowanceLoading,
    isSigned: state.isSigned,
  };
};
