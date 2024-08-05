import { useCallback } from "react";
import { sendAndWaitForConfirmations, useEstimateGasPrice } from "../..";
import { useMainContext } from "../../context/MainContext";

export const useSendAndWaitForConfirmations = () => {
  const { web3, chainId, account } = useMainContext();
  const gas = useEstimateGasPrice();
  return useCallback(
    async ({
      tx,
      onTxHash,
    }: {
      tx: any;
      onTxHash: (value: string) => void;
    }) => {
      if (!web3 || !chainId) {
        throw new Error("No web3 or chainId found");
      }
      await sendAndWaitForConfirmations({
        web3,
        chainId,
        tx,
        opts: {
          from: account,
          maxFeePerGas: gas?.data?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.data?.priorityFeePerGas,
        },
        onTxHash,
      });
    },
    [web3, chainId, account, gas]
  );
};
