import { useSwapState } from "../store/main";
import { STEPS } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import { useShallow } from "zustand/react/shallow";
import { counter, sendAndWaitForConfirmations } from "../util";
import { swapAnalytics } from "../analytics";
import { maxUint256, permit2Address } from "../config/consts";

export const useApprove = () => {
  const { account, web3, chainId } = useMainContext();
  const getContract = useContractCallback();
  const updateState = useSwapState(useShallow((s) => s.updateState));
  return useCallback(
    async (fromToken?: string, fromAmount?: string) => {
      try {
        const fromTokenContract = getContract(fromToken);
        if (
          !fromAmount ||
          !fromToken ||
          !fromTokenContract ||
          !account ||
          !web3 ||
          !chainId
        ) {
          throw new Error("missing args");
        }
        const count = counter();
        swapAnalytics.onApprovalRequest();
        updateState({ swapStatus: "loading", currentStep: STEPS.APPROVE });
        const tx = fromTokenContract.methods.approve(
          permit2Address,
          maxUint256
        );

        await sendAndWaitForConfirmations(web3, chainId, tx, { from: account });
        swapAnalytics.onApprovalSuccess(count());

        updateState({ swapStatus: "success" });
      } catch (error) {
        throw error;
      }
    },
    [account, updateState, getContract]
  );
};
