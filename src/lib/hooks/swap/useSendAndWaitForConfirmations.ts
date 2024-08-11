import { sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useCallback } from "react";
import { useEstimateGasPrice } from "../..";
import { useMainContext } from "../../context/MainContext";

export const useSendAndWaitForConfirmations = () => {
  const { web3, chainId, account } = useMainContext();
  const gas = useEstimateGasPrice();
  return useCallback(
    async ({
      tx,
      value,
      onTxHash,
    }: {
      tx: any;
      value?: string;
      onTxHash?: (value: string) => void;
    }) => {
      if (!web3 || !chainId) {
        throw new Error("No web3 or chainId found");
      }
      await sendAndWaitForConfirmations(
        tx,
        {
          from: account!,
          maxFeePerGas: gas?.data?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.data?.priorityFeePerGas,
          value
        },
        undefined,
        undefined,
        {
          onTxHash,
        }
      );
    },
    [web3, chainId, account, gas]
  );
};
