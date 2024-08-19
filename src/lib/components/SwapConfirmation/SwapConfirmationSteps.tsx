import { useSwapConfirmationContext } from "./context";
import { SwapSteps } from "./Steps";
import { useSwapConfirmationSteps } from "./useSwapConfirmationSteps";

export const SwapConfirmationSteps = () => {
  const { refetchQuote } = useSwapConfirmationContext();

  const steps = useSwapConfirmationSteps();

  return <SwapSteps steps={steps} refetchQuote={refetchQuote} />;
};
