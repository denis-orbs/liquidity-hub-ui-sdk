import { useCallback, useMemo, useState } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import { UseLiquidityHubArgs } from "../../type";
import { isNativeAddress, safeBN } from "../../util";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";
import {
  useAmountUI,
  useBalance,
  useIsDisabled,
  UseLiquidityHubState,
  usePriceChanged,
  useSteps,
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

  const getSwapRoute = useSwapRoute(disabled);

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

  const {
    data: isApproved,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useAllowance(args.fromToken, fromAmount);
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
  } = useSubmitSwap({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    refetchAllowance,
    updateState,
    approved: isApproved,
    quote: quote.data,
  });

  const balance = useBalance(args.fromToken).data;

  const swapButtonContent = useMemo(() => {
    if (BN(balance || "0").isLessThan(fromAmount || "0")) {
      return "Insufficient balance";
    }

    if (BN(quote.data?.outAmount || "0").isLessThan(0)) {
      return "No liquidity for this trade";
    }

    if (isNativeAddress(args.fromToken?.address || "")) return "Wrap and Swap";
    if (!isApproved) return "Approve and Swap";
    return "Sign and Swap";
  }, [isApproved, args.fromToken, fromAmount, quote.data?.outAmount, balance]);

  const priceChangeWarning = usePriceChanged({
    quote: quote.data,
    originalQuote: state.originalQuote,
    swapStatus: state.swapStatus,
    showConfirmation: state.showConfirmation,
    toToken: args.toToken,
  });
  

  const modalTitle = useMemo(() => {
    if (state.swapStatus === "failed") return;
    if (state.swapStatus === "success") return "Swap Successfull";
    return "Review Swap";
  }, [state.swapStatus]);

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
        setTimeout(() => {
          setState(
            (prev) =>
              ({ failures: (prev.failures || 0) + 1 } as UseLiquidityHubState)
          );
        }, timeout);
      }
    },
    [state.swapStatus, updateState, setState, quote.refetch]
  );

  const steps = useSteps({
    fromToken: args.fromToken,
    currentStep: state.currentStep,
    isSigned: state.isSigned,
    allowanceLoading,
    isApproved,
  });

  return {
    quote,
    txHash: state.txHash,
    onShowConfirmation,
    swapError: state.swapStatus === "failed" ? swapError : undefined,
    analyticsInit,
    getSwapRoute,
    swapStatus: state.swapStatus,
    modalTitle,
    submitSwap,
    swapButtonContent,
    swapButtonDisabled: allowanceLoading || swapLoading,
    priceChangeWarning,
    swapLoading,
    fromToken: args.fromToken,
    toToken: args.toToken,
    isOpen: state.showConfirmation,
    onClose,
    currentStep: state.currentStep,
    steps,
    isWrapped: state.isWrapped,
    fromAmount: useAmountUI(args.fromToken?.decimals, fromAmount),
    outAmount: quote.data?.ui.outAmount,
  };
};
