import {  Token } from "../../type";
import { useCallback } from "react";
import { useMainContext } from "../../provider";
import { useContractCallback } from "../useContractCallback";
import { swapAnalytics } from "../../analytics";
import { counter, sendAndWaitForConfirmations } from "../../util";
import { useEstimateGasPrice } from "../useSwapDetails";

export const useWrap = (fromToken?: Token) => {
  const { account, chainId, web3 } = useMainContext();
  const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useCallback(
    async (fromAmount: string) => {
      const fromTokenContract = getContract(fromToken?.address);

      if (!account || !fromToken || !fromTokenContract || !chainId || !web3) {
        throw new Error("Missing args");
      }
      const count = counter();
      swapAnalytics.onWrapRequest();

      try {
        const tx = fromTokenContract.methods.deposit();
        await sendAndWaitForConfirmations(web3, chainId, tx, {
          from: account,
          value: fromAmount,
          maxFeePerGas: gas?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.priorityFeePerGas,
        });

        swapAnalytics.onWrapSuccess(count());
         return true;
      } catch (error) {
        swapAnalytics.onWrapFailed((error as any).message, count());
        throw new Error('Failed to wrap');
      }
    },
    [account, getContract, fromToken, gas]
  );
};
