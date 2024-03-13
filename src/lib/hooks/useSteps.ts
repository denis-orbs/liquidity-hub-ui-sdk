import { useMemo } from "react";

import { useAllowance } from "./useAllowance";
import SwapImg from "../assets/swap.svg";
import ApproveImg from "../assets/approve.svg";

import { useSwapState } from "../store/main";
import { Step, STEPS } from "../type";
import { isNativeAddress } from "../util";

export const useSteps = (): { steps: Step[]; isLoading: boolean } => {
  const { fromToken, fromAmount } = useSwapState((store) => ({
    fromToken: store.fromToken,
    fromAmount: store.fromAmount,
  }));

  const { isLoading: allowanceQueryLoading, data: isApproved } = useAllowance(
    fromToken,
    fromAmount
  );
  return useMemo(() => {
    if (allowanceQueryLoading) {
      return {
        steps: [],
        isLoading: true,
      };
    } 

    const wrap: Step = {
      title: `Wrap ${fromToken?.symbol}`,
      image: SwapImg,
      id: STEPS.WRAP,
    };

    const approve: Step = {
      title: `Approve ${fromToken?.symbol} spending`,
      image:ApproveImg,
      id: STEPS.APPROVE,
    };


    const sendTx: Step = {
      id: STEPS.SEND_TX,
      title: "Confirm swap",
      image: SwapImg,
    };

    const steps = [sendTx];

    if (!isApproved) {
      steps.unshift(approve);
    }

    if (isNativeAddress(fromToken?.address || "")) {
      steps.unshift(wrap);
    }
    return { steps, isLoading: false };
  }, [fromToken, isApproved, allowanceQueryLoading]);
};
