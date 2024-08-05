import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step, STEPS } from "../../type";
import { isNativeAddress } from "../../util";
import { useChainConfig } from "../useChainConfig";
import { useAllowance } from "./useAllowance";
import { useMainContext } from "../../context/MainContext";

export const useSteps = () => {
  const { state:{fromToken, currentStep, signature} } = useMainContext();
  const explorer = useChainConfig()?.explorer;
  const { data: hasAllowance, isLoading: allowanceLoading } = useAllowance();

  const steps = useMemo(() => {
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
      title: signature ? "Swap pending..." : "Sign and Confirm swap",
      image: SwapImg,
    };

    const steps = [sendTx];

    if (!hasAllowance) {
      steps.unshift(approve);
    }

    if (isNativeAddress(fromToken?.address || "")) {
      steps.unshift(wrap);
    }
    return steps;
  }, [
    fromToken,
    hasAllowance,
    allowanceLoading,
    signature,
    currentStep,
    explorer,
  ]);

  return {
    steps: allowanceLoading ? [] : steps,
    isLoading: allowanceLoading,
  };
};
