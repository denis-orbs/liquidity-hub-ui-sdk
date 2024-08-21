import { useSwapSteps } from "../../hooks";
import { useSwapConfirmationContext } from "./context";

export function useSwapConfirmationSteps() {
  const { swapStep, fromToken, hasAllowance } =
    useSwapConfirmationContext();
  return useSwapSteps(swapStep, fromToken, hasAllowance);
}
