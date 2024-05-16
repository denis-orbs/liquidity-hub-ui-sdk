
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import BN from "bignumber.js";
import { sendAndWaitForConfirmations } from "../util";
import { zeroAddress } from "../config/consts";
import { useEstimateGasPrice } from "./useSwapDetails";

export const useUnwrap = () => {
  const { account, web3, chainId } = useMainContext();
  const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useCallback(
    async (fromAmount: string) => {
      try {
        const fromTokenContract = getContract(zeroAddress);

        if (!account || !fromTokenContract || !chainId || !web3) {
          throw new Error("Missing account");
        }
        const tx = fromTokenContract.methods.withdraw(
          new BN(fromAmount).toFixed(0)
        );
        await sendAndWaitForConfirmations(web3, chainId, tx, {
          from: account,
          maxFeePerGas: gas?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.priorityFeePerGas,
        });

        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [account, getContract, gas]
  );
};
