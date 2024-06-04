import { useCallback, useMemo, useState } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import {
  ActionStatus,
  QuoteResponse,
  STEPS,
  SwapConfirmationArgs,
  UseLiquidityHubArgs,
} from "../../type";
import { isNativeAddress, safeBN } from "../../util";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";
import {
  useBalance,
  useIsDisabled,
  usePriceChanged,
  useSteps,
  useSubmitSwap,
  useSwapRoute,
} from "../..";
import BN from "bignumber.js";
export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [swapStatus, setSwapStatus] = useState<ActionStatus>(undefined);
  const [currentStep, setCurrentStep] = useState<STEPS | undefined>(undefined);
  const [originalQuote, setOriginalQuote] = useState<QuoteResponse | undefined>(
    undefined
  );
  const [swapError, setSwapError] = useState<string | undefined>(undefined);
  const [failures, setFailures] = useState(0);

  const debouncedFromAmount = useDebounce(
    args.fromAmount,
    _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );
  const disabled = useIsDisabled({
    failures,
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

  const updateSwapStatus = useCallback((status: ActionStatus) => {
    setSwapStatus(status);
  }, []);

  const incrementFailues = useCallback(() => {
    setFailures((prev) => prev + 1);
  }, []);

  const resetFailures = useCallback(() => {
    setFailures(0);
  }, []);

  const updateSwapStep = useCallback((step?: STEPS) => {
    setCurrentStep(step);
  }, []);

  const quote = useQuote({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    swapStatus,
    showConfirmation,
    disabled,
    slippage,
  });
  const { data: isApproved, isLoading: approvalLoading, refetch: refetchAllowance } = useAllowance(
    args.fromToken,
    fromAmount
  );
  const analyticsInit = useAnalytics({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    dexMinAmountOut,
    quote: quote.data,
    slippage
  }).initTrade;

  const onShowConfirmation = useCallback(() => {
    setShowConfirmation(true);
    setOriginalQuote(quote.data);
  }, [quote.data]);
  const { onSwap: submitSwap, isSigned, isWrapped } = useSubmitSwap({
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmount,
    updateSwapStatus,
    updateSwapStep,
    setSwapError,
    incrementFailues,
    resetFailures,
    refetchAllowance,
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
    originalQuote,
    swapStatus,
    showConfirmation,
    toToken: args.toToken,
  });

  const modalTitle = useMemo(() => {
    if (swapStatus === "failed") {
      return;
    }
    if (swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [swapStatus]);

  const onClose = useCallback(() => {
    setShowConfirmation(false);
    setOriginalQuote(undefined);
    if (swapStatus === "failed") {
      setTimeout(() => {
        setSwapStatus(undefined);
        setCurrentStep(undefined);
        setSwapError(undefined);
      }, 3_00);
    } else if (swapStatus === "success") {
      setTimeout(() => {
        setSwapStatus(undefined);
        setCurrentStep(undefined);
        setSwapError(undefined);
      }, 3_00);
    }
  }, [swapStatus]);

  const steps = useSteps({
    fromToken: args.fromToken,
    currentStep,
    isSigned,
  });

  return {
    quote,
    onShowConfirmation,
    swapError,
    analyticsInit,
    isApproved,
    getSwapRoute,
    swapConfirmation: {
      swapStatus,
      modalTitle,
      submitSwap,
      swapButtonContent,
      swapButtonDisabled: approvalLoading || swapStatus === "loading",
      priceChangeWarning,
      swapLoading: swapStatus === "loading",
      fromAmount,
      outAmount: quote.data?.ui.outAmount,
      fromToken: args.fromToken,
      toToken: args.toToken,
      isOpen: showConfirmation,
      onClose,
      currentStep,
      originalQuote,
      steps,
      isLoading: swapStatus === "loading",
      isWrapped
    } as SwapConfirmationArgs,
  };
};
