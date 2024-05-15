import { useSwapState } from "../../store/main";
import { STEPS, Token } from "../../type";
import { useCallback } from "react";
import { useMainContext } from "../../provider";
import { useContractCallback } from "../useContractCallback";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../../analytics";
import { counter, sendAndWaitForConfirmations } from "../../util";
import { useEstimateGasPrice } from "../useSwapDetails";

export const useWrap = (fromToken?: Token) => {
  const { account, chainId, web3 } = useMainContext();
  const updateState = useSwapState(useShallow((s) => s.updateState));
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

      updateState({ swapStatus: "loading", currentStep: STEPS.WRAP });
      try {
        const tx = fromTokenContract.methods.deposit();
        await sendAndWaitForConfirmations(web3, chainId, tx, {
          from: account,
          value: fromAmount,
          maxFeePerGas: gas?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.priorityFeePerGas,
        });

        swapAnalytics.onWrapSuccess(count());
        updateState({ swapStatus: "success" });
         return true;
      } catch (error) {
        swapAnalytics.onWrapFailed((error as any).message, count());
        throw new Error('Failed to wrap');
      }
    },
    [account, updateState, getContract, fromToken, gas]
  );
};
