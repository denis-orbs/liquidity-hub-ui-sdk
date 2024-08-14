import { useWethContract } from "../useContractCallback";
import BN from "bignumber.js";
import { Logger } from "../../util";
import { useSendAndWaitForConfirmations } from "./useSendAndWaitForConfirmations";
import { useCallback } from "react";
import Web3 from "web3";

export const useUnwrapCallback = (
  account?: string,
  web3?: Web3,
  chainId?: number
) => {
  const sendAndWaitForConfirmations = useSendAndWaitForConfirmations(
    web3,
    chainId,
    account
  );

  const contract = useWethContract();
  return useCallback(
    async (fromAmount: string) => {
      try {
        if (!contract) {
          throw new Error("Missing account");
        }
        const tx = contract.methods.withdraw(new BN(fromAmount).toFixed(0));
        await sendAndWaitForConfirmations({ tx });

        return true;
      } catch (error: any) {
        Logger({ error });

        throw new Error(error.message);
      }
    },
    [contract, sendAndWaitForConfirmations]
  );
};
