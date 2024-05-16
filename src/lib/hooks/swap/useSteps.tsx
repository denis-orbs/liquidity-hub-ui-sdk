import { useMemo } from "react";
import SwapImg from "../../assets/swap.svg";
import ApproveImg from "../../assets/approve.svg";
import { Step, STEPS, Token } from "../../type";
import { isNativeAddress } from "../../util";
import { useChainConfig } from "../useChainConfig";

export const useSteps = ({
  fromToken,
  isSigned,
  isApproved
}: {
  fromToken?: Token;
  isSigned?: boolean;
  isApproved?: boolean;
}) => {
  const explorer = useChainConfig()?.explorerUrl;

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
    isSigned,
    explorer,
  ]);

  return steps
};
