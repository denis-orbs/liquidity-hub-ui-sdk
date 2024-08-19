import { useSwapSteps } from "../../hooks";
import { useSwapConfirmationContext } from "./context";

export function useSwapConfirmationSteps() {
  const { swapStep, fromToken, hasAllowance, chainId, txHash } =
    useSwapConfirmationContext();
  return useSwapSteps(swapStep, fromToken, hasAllowance, chainId, txHash);
}
