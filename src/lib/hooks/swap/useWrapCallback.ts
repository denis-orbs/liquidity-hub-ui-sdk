import { useCallback } from "react";
import Web3 from "web3";
import { swapAnalytics } from "../../analytics";
import { counter } from "../../util";
import { useWethContract } from "../useContractCallback";
import { useSendAndWaitForConfirmations } from "./useSendAndWaitForConfirmations";

export const useWrapCallback = (
  account?: string,
  web3?: Web3,
  chainId?: number
) => {
  const sendAndWaitForConfirmations = useSendAndWaitForConfirmations(
    web3,
    chainId,
    account
  );
  const contract = useWethContract(web3, chainId);

  return useCallback(
    async (fromAmount: string) => {
      let txHash = "";

      if (!contract) {
        throw new Error("Contract not found");
      }
      const count = counter();
      swapAnalytics.onWrapRequest();

      try {
        await sendAndWaitForConfirmations({
          tx: contract.methods.deposit(),
          value: fromAmount,
          onTxHash: (wrapTxHash) => {
            txHash = wrapTxHash;
          },
        });

        swapAnalytics.onWrapSuccess(count());
        return txHash;
      } catch (error) {
        swapAnalytics.onWrapFailed((error as any).message, count());
        throw error;
      }
    },
    [contract, sendAndWaitForConfirmations]
  );
};
