import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step, SwapSteps } from "../../type";
import { useSwapConfirmationContext } from "../../components/SwapConfirmation/context";
import { isNativeAddress } from "@defi.org/web3-candies";
import { getChainConfig } from "../../util";

export const useSteps = () => {
  const { swapStep, fromToken, hasAllowance, chainId } = useSwapConfirmationContext();
  const explorer = useMemo(() => getChainConfig(chainId)?.explorer, [chainId]);

  const steps = useMemo(() => {
    const wrap: Step = {
      title: `Wrap ${fromToken?.symbol}`,
      image: SwapImg,
      id: SwapSteps.WRAP,
      completed: (swapStep || 0) > SwapSteps.WRAP,
      active:  (swapStep || 0)  === SwapSteps.WRAP
    };

    const approve: Step = {
      title: `Approve ${fromToken?.symbol} spending`,
      image: ApproveImg,
      id: SwapSteps.APPROVE,
      completed: (swapStep || 0) > SwapSteps.APPROVE,
      active:  (swapStep || 0)  === SwapSteps.APPROVE
    };

    const sendTx: Step = {
      id: SwapSteps.SENT_TX,
      title: SwapSteps.SENT_TX ? "Swap pending..." : "Sign and Confirm swap",
      image: SwapImg,
      active:  (swapStep || 0)  >= SwapSteps.SIGN
    };

    const steps = [sendTx];

    if (!hasAllowance) {
      steps.unshift(approve);
    }

    if (isNativeAddress(fromToken?.address || "")) {
      steps.unshift(wrap);
    }
    return steps;
  }, [swapStep, fromToken?.address, fromToken?.symbol, hasAllowance, explorer]);

  return steps;
};
