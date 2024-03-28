import { useMemo } from "react";

import { useAllowance } from "./useAllowance";
import SwapImg from "../assets/swap.svg";
import ApproveImg from "../assets/approve.svg";

import { useSwapState } from "../store/main";
import { Step, STEPS } from "../type";
import { isNativeAddress } from "../util";
import { useShallow } from "zustand/react/shallow";

export const useSteps = () => {
  const { fromToken, currentStep, status, isSigned } = useSwapState(
    useShallow((store) => ({
      fromToken: store.fromToken,
      currentStep: store.currentStep,
      status: store.swapStatus,
      isSigned: store.isSigned,
    }))
  );

  const { isLoading: allowanceQueryLoading, data: isApproved } = useAllowance();
  const steps = useMemo(() => {
    if (allowanceQueryLoading) {
      return [];
    }

    const wrap: Step = {
      title: `Wrap ${fromToken?.symbol}`,
      image: SwapImg,
      id: STEPS.WRAP,
    };

    const approve: Step = {
      title: `Approve ${fromToken?.symbol} spending`,
      image: ApproveImg,
      id: STEPS.APPROVE,
    };

    const sendTx: Step = {
      id: STEPS.SEND_TX,
      title: isSigned ? "Swap pending..." : "Sign and Confirm swap",
      image: SwapImg,
    };

    const steps = [sendTx];

    if (!isApproved) {
      steps.unshift(approve);
    }

    if (isNativeAddress(fromToken?.address || "")) {
      steps.unshift(wrap);
    }
    return steps;
  }, [
    fromToken,
    isApproved,
    allowanceQueryLoading,
    isSigned,
    currentStep,
  ]);

  return {
    steps,
    isLoading: allowanceQueryLoading,
    currentStep,
    status,
  };
};
