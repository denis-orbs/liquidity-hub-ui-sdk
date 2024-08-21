import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step, SwapStep, Token } from "../../type";
import { isNativeAddress } from "@defi.org/web3-candies";


export const useSwapSteps = (
  swapStep?: SwapStep,
  fromToken?: Token,
  hasAllowance?: boolean,
  signatureTimeout?: number
) => {
  const _swapStep = swapStep || 0;
  const steps = useMemo(() => {
    const wrap: Step = {
      title: `Wrap ${fromToken?.symbol}`,
      image: fromToken?.logoUrl,
      id: SwapStep.WRAP,
      completed: _swapStep > SwapStep.WRAP,
      active: _swapStep === SwapStep.WRAP,
    };

    const approve: Step = {
      title: `Approve ${fromToken?.symbol} spending`,
      image: ApproveImg,
      id: SwapStep.APPROVE,
      completed: _swapStep > SwapStep.APPROVE,
      active: _swapStep === SwapStep.APPROVE,
    };

    const sendTx: Step = {
      id: SwapStep.SIGN,
      title: _swapStep ===  SwapStep.SWAP ? "Swap pending..." : "Sign and Confirm swap",
      image: SwapImg,
      active: _swapStep >= SwapStep.SIGN,
      timeout: _swapStep === SwapStep.SIGN ? signatureTimeout : undefined,
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
    _swapStep,
    fromToken?.address,
    fromToken?.symbol,
    hasAllowance,
    signatureTimeout,
  ]);

  return hasAllowance === undefined ? undefined : steps;
};
