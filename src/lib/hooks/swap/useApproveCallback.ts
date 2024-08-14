import { maxUint256, permit2Address } from "@defi.org/web3-candies";
import { useCallback } from "react";
import Web3 from "web3";
import { swapAnalytics } from "../../analytics";
import { Token } from "../../type";
import { counter } from "../../util";
import { useContract } from "../useContractCallback";
import { useSendAndWaitForConfirmations } from "./useSendAndWaitForConfirmations";

export const useApproveCallback = (
  account?: string,
  web3?: Web3,
  chainId?: number,
  fromToken?: Token
) => {
  const contract = useContract(fromToken?.address, web3, chainId);
  const sendAndWaitForConfirmations = useSendAndWaitForConfirmations(
    web3,
    chainId,
    account
  );
  return useCallback(async () => {
    let txHash = "";
    if (!contract) {
      throw new Error("Contract not found");
    }
    const count = counter();
    swapAnalytics.onApprovalRequest();
    try {
      await sendAndWaitForConfirmations({
        tx: contract.methods.approve(permit2Address, maxUint256),
        onTxHash: (approveTxHash) => {
          txHash = approveTxHash;
        },
      });
      return txHash;
    } catch (error) {
      swapAnalytics.onApprovalFailed((error as any).message, count());
      throw error;
    }
  }, [
    fromToken,
    contract,
    sendAndWaitForConfirmations,
    account,
    chainId,
    web3,
  ]);
};
