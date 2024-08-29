import { useSwapSteps } from "../../hooks";
import { useSwapConfirmationContext } from "./context";

export function useSwapConfirmationSteps() {
  const { swapStep, fromToken, hasAllowance, counters } =
    useSwapConfirmationContext();
  return useSwapSteps(swapStep, fromToken, hasAllowance, counters);
}
