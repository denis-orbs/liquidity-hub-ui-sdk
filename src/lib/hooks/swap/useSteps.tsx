import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step } from "../../type";
import { useChainConfig } from "../useChainConfig";
import { useSwapConfirmationContext } from "../../components/SwapConfirmation/context";
import { isNativeAddress } from "@defi.org/web3-candies";

export const useSteps = () => {
  const explorer = useChainConfig()?.explorer;
  const { swapStep, fromToken, hasAllowance } =
    useSwapConfirmationContext();

  const steps = useMemo(() => {
    const wrap: Step = {
      title: `Wrap ${fromToken?.symbol}`,
      image: SwapImg,
      id: 'wrap',
      completed: swapStep === 'approve'
    };

    const approve: Step = {
      title: `Approve ${fromToken?.symbol} spending`,
      image: ApproveImg,
      id: 'approve',
      completed: swapStep === 'sign'
    };

    const sendTx: Step = {
      id: 'swap',
      title:
      swapStep === 'swap'
          ? "Swap pending..."
          : "Sign and Confirm swap",
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
    swapStep,
    fromToken?.address,
    fromToken?.symbol,
    hasAllowance,
    explorer,
  ]);

  return steps;
};
