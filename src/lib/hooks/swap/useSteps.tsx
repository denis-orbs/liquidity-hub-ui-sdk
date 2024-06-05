import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step, STEPS, Token } from "../../type";
import { isNativeAddress } from "../../util";
import { useChainConfig } from "../useChainConfig";
import { useAllowance } from "./useAllowance";

export const useSteps = ({
  fromToken,
  currentStep,
  isSigned,
  fromAmount,
}: {
  fromToken?: Token;
  currentStep?: STEPS;
  isSigned: boolean;
  fromAmount?: string;
}) => {
  const explorer = useChainConfig()?.explorerUrl;
  const { data: hasAllowance, isLoading: allowanceLoading } = useAllowance(
    fromToken?.address,
    fromAmount
  );

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
      title: isSigned ? "Swap pending..." : "Sign and Confirm swap",
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
    isSigned,
    currentStep,
    explorer,
  ]);

  return {
    steps: allowanceLoading ? [] : steps,
    isLoading: allowanceLoading,
  };
};
