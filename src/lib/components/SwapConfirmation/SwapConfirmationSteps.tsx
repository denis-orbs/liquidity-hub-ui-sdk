import { SwapSteps } from "./Steps";
import { useSwapConfirmationSteps } from "./useSwapConfirmationSteps";

export const SwapConfirmationSteps = () => {

  const steps = useSwapConfirmationSteps();

  return <SwapSteps steps={steps} />;
};


