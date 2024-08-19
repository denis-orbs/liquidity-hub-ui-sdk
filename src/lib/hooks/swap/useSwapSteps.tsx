import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step, SwapStep, Token } from "../../type";
import { isNativeAddress } from "@defi.org/web3-candies";
import { getChainConfig } from "../../util";

export const useSwapSteps = (
  swapStep?: SwapStep,
  fromToken?: Token,
  hasAllowance?: boolean,
  chainId?: number,
  txHash?: string
) => {
  const explorer = useMemo(() => getChainConfig(chainId)?.explorer, [chainId]);

  const steps = useMemo(() => {
    const wrap: Step = {
      title: `Wrap ${fromToken?.symbol}`,
      image: SwapImg,
      id: SwapStep.WRAP,
      completed: (swapStep || 0) > SwapStep.WRAP,
      active: (swapStep || 0) === SwapStep.WRAP,
    };

    const approve: Step = {
      title: `Approve ${fromToken?.symbol} spending`,
      image: ApproveImg,
      id: SwapStep.APPROVE,
      completed: (swapStep || 0) > SwapStep.APPROVE,
      active: (swapStep || 0) === SwapStep.APPROVE,
    };

    const sendTx: Step = {
      id: SwapStep.SIGN_AND_SEND,
      title: txHash ? "Swap pending..." : "Sign and Confirm swap",
      image: SwapImg,
      active: (swapStep || 0) >= SwapStep.SIGN_AND_SEND,
    };

    const steps = [sendTx];

    if (!hasAllowance) {
      steps.unshift(approve);
    }

    if (isNativeAddress(fromToken?.address || "")) {
      steps.unshift(wrap);
    }
    return steps;
  }, [swapStep, fromToken?.address, fromToken?.symbol, hasAllowance, explorer, txHash]);

  return hasAllowance === undefined ? undefined : steps;
};
