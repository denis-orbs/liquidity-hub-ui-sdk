import { sendAndWaitForConfirmations, setWeb3Instance } from "@defi.org/web3-candies";
import { useCallback } from "react";
import Web3 from "web3";
import { useEstimateGasPrice } from "../..";

export const useSendAndWaitForConfirmations = (
  web3?: Web3,
  chainId?: number,
  account?: string
) => {
  const gas = useEstimateGasPrice(web3, chainId);
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
      setWeb3Instance(web3);
      await sendAndWaitForConfirmations(
        tx,
        {
          from: account!,
          maxFeePerGas: gas?.data?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.data?.priorityFeePerGas,
          value,
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
