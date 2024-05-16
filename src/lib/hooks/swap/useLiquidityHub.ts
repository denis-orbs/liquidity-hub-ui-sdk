import { useCallback, useMemo, useState } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import { ActionStatus, UseLiquidityHubArgs } from "../../type";
import { isNativeAddress } from "../../util";
import _ from "lodash";
import { useAnalytics } from "../useAnalytics";
import { useDebounce } from "../useDebounce";
import {
  useAmountUI,
  useGasCostUsd,
  useOrders,
  usePriceImpact,
  useSlippage,
  useSteps,
  useSwapRoute,
  useUsdAmounts,
} from "../../hooks";
import { useSubmitSwap } from "./useSubmitSwap";
import { useIsDisabled } from "../useIsDisabled";

// const useQuoteDelay = (
//   fromAmount: string,
//   dexMinAmountOut?: string,
//   quoteDelayMillis?: number
// ) => {
//   const quoteTimeoutRef = useRef<any>(null);
//   const lhControl = useLiquidityHubPersistedStore((s) => s.lhControl);
//   const [enabled, setEnabled] = useState(false);

//   useEffect(() => {
//     Logger({
//       fromAmount,
//       dexMinAmountOut,
//       quoteDelayMillis,
//     });
//     clearTimeout(quoteTimeoutRef.current);
//     if (enabled || BN(fromAmount).isZero()) return;
//     if (!quoteDelayMillis || lhControl === LH_CONTROL.FORCE) {
//       setEnabled(true);
//       return;
//     }

//     if (BN(dexMinAmountOut || "0").gt(0)) {
//       Logger("got price from dex, enabling quote ");
//       setEnabled(true);
//       clearTimeout(quoteTimeoutRef.current);
//       return;
//     }
//     Logger("starting timeout to enable quote");
//     quoteTimeoutRef.current = setTimeout(() => {
//       setEnabled(true);
//     }, quoteDelayMillis);
//   }, [dexMinAmountOut, quoteDelayMillis, enabled, fromAmount, lhControl]);

//   return enabled;
// };

export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [failures, setFailures] = useState(0);
  const [swapStatus, setSwapStatus] = useState<ActionStatus>(undefined);

  const updateSwapStatus = useCallback(
    (status: ActionStatus) => {
      setSwapStatus(status);
    },
    [setSwapStatus]
  );

  const icrementFailures = useCallback(() => {
    setFailures((f) => f + 1);
  }, [setFailures]);

  const onSwapSuccess = useCallback(() => {
    setFailures(0);
  }, [setFailures]);

  const fromAmount = useDebounce(
    args.fromAmount,
    _.isUndefined(args.debounceFromAmountMillis)
      ? 2_00
      : args.debounceFromAmountMillis
  );

  const disabled = useIsDisabled(failures, args.disabled);
  const slippage = useSlippage(args.slippage);
  const quote = useQuote({
    fromAmount,
    fromToken: args.fromToken,
    toToken: args.toToken,
    disabled,
    dexMinAmountOut: args.minAmountOut,
    swapStatus,
    slippage,
  });
  const { data: isApproved, isLoading: approvalLoading } = useAllowance(args.fromToken, fromAmount);

  const usdAmounts = useUsdAmounts({
    fromToken: args.fromToken,
    fromAmount: args.fromAmount,
    toToken: args.toToken,
    outAmount: quote?.data?.outAmount,
    inTokenUsd: args.inTokenUsd,
    outTokenUsd: args.outTokenUsd,
  });

  const addOrder = useOrders(usdAmounts.inToken, usdAmounts.outToken).addOrder;

  const analyticsInit = useAnalytics({
    fromToken: args.fromToken,
    toToken: args.toToken,
    dexMinAmountOut: args.minAmountOut,
    fromAmount,
    outTokenUsdAmount: usdAmounts.outToken,
    inTokenUsdAmount: usdAmounts.inToken,
    quoteAmountOut: quote.data?.outAmount,
  }).initTrade;

  const onShowConfirmation = useCallback(() => {
    setShowConfirmation(true);
  }, [setShowConfirmation]);

  const {
    swapCallback,
    currentStep,
    swapError,
    isSigned,
    reset: resetSwap,
    txHash,
  } = useSubmitSwap({
    fromAmount,
    fromToken: args.fromToken,
    toToken: args.toToken,
    approved: isApproved,
    addOrder,
    quote: quote.data,
    onWrapSuccess: args.onWrapSuccess,
    onError: icrementFailures,
    onSuccess: onSwapSuccess,
    updateSwapStatus,
  });

  const onCloseConfirmation = useCallback(() => {
    setShowConfirmation(false);

    if (swapStatus === "success" || swapStatus === "failed") {
      setTimeout(() => {
        resetSwap();
      }, 3_00);
    }
  }, [setShowConfirmation, swapStatus, resetSwap]);

  const swapRoute = useSwapRoute(
    quote.data?.outAmount,
    args.minAmountOut,
    disabled
  );
  const steps = useSteps(args.fromToken,
    isSigned,
    isApproved,);

  const gasCost = useGasCostUsd(
    args.outTokenUsd,
    args.toToken,
    quote.data?.gasCostOutputToken
  );

  return {
    txHash,
    quote: quote.data,
    quoteLoading: quote.isLoading,
    quoteError: quote.error,
    onShowConfirmation,
    analyticsInit,
    isApproved,
    swapCallback,
    priceImpact: usePriceImpact(usdAmounts.inToken, usdAmounts.outToken),
    gasCost,
    fromToken: args.fromToken,
    toToken: args.toToken,
    fromAmountUi: useAmountUI(args.fromToken?.decimals, fromAmount),
    fromAmount,
    inTokenUsdAmount: usdAmounts.inToken,
    outTokenUsdAmount: usdAmounts.outToken,
    swapRoute,
    confirmation: {
      btnText: useSubmitBtnText(isApproved, args.fromToken?.address),
      steps,
      title: useTitle(swapStatus),
      onCloseConfirmation,
      showConfirmation,
      currentStep,
      isLoading: swapStatus === "loading" || approvalLoading,
      swapStatus,
      swapError,
    },
  };
};

const useSubmitBtnText = (isApproved?: boolean, fromToken?: string) => {
  return useMemo(() => {
    if (isNativeAddress(fromToken || "")) return "Wrap and Swap";
    if (!isApproved) return "Approve and Swap";
    return "Sign and Swap";
  }, [isApproved, fromToken]);
};

const useTitle = (swapStatus: ActionStatus) => {
  return useMemo(() => {
    if (swapStatus === "failed") {
      return;
    }
    if (swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [swapStatus]);
};
