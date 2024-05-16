import { useCallback } from "react";
import { useMainContext } from "../../provider";
import { useContractCallback } from "../useContractCallback";
import { counter, sendAndWaitForConfirmations } from "../../util";
import { swapAnalytics } from "../../analytics";
import { maxUint256, permit2Address } from "../../config/consts";

export const useApprove = () => {
  const { account, web3, chainId } = useMainContext();
  const getContract = useContractCallback();
  return useCallback(
    async (fromToken?: string, fromAmount?: string) => {
      const count = counter();
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
        swapAnalytics.onApprovalRequest();
        const tx = fromTokenContract.methods.approve(
          permit2Address,
          maxUint256
        );

        await sendAndWaitForConfirmations(web3, chainId, tx, { from: account });
        swapAnalytics.onApprovalSuccess(count());
      } catch (error) {
        swapAnalytics.onApprovalFailed((error as any).message, count());
        throw new Error('Failed to approve');
      }
    },
    [account, getContract]
  );
};
