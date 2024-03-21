import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";

export function useSwapSuccessData() {
  const successDetails = useSwapState(useShallow((state) => state.successDetails));

  const fromAmount = useAmountUI(
    successDetails?.fromToken?.decimals,
    successDetails?.fromAmount || "0"
  );

  const toAmount = useAmountUI(
    successDetails?.toToken?.decimals,
    successDetails?.toAmount || "0"
  );

  return {
    fromAmount,
    toAmount,
    fromToken: successDetails?.fromToken,
    toToken: successDetails?.toToken,
    fromTokenUsd: successDetails?.fromTokenUsd,
    toTokenUsd: successDetails?.toTokenUsd,
  };
}

