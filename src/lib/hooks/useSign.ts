import { useSwapState } from "../store/main";
import { STEPS } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { counter, signEIP712 } from "../util";
import { swapAnalytics } from "../analytics";

export const useSign = () => {
  const { account, web3 } = useMainContext();
  const updateState = useSwapState((s) => s.updateState);

  return useCallback(
    async (permitData: any) => {

      updateState({ swapStatus: "loading", currentStep: STEPS.SEND_TX });
      const count = counter();
      try {
        if (!account || !web3) {
          throw new Error("No account or web3");
        }
        swapAnalytics.onSignatureRequest();

        const signature = await signEIP712(web3, account, permitData);
        swapAnalytics.onSignatureSuccess(signature, count());

        return signature;
      } catch (error) {
        swapAnalytics.onSignatureFailed((error as any).message, count());
        throw new Error((error as any).message);
      }
    },
    [updateState, account, web3]
  );
};
