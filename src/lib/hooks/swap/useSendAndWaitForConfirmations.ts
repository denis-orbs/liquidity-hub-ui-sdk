import {
  sendAndWaitForConfirmations,
  setWeb3Instance,
  estimateGasPrice,
} from "@defi.org/web3-candies";
import { useCallback } from "react";
import BN from "bignumber.js";
import Web3 from "web3";

const getGasPrice = async (web3: Web3) => {
  const result = await estimateGasPrice(undefined, undefined, web3);
  const priorityFeePerGas = result?.fast.tip || 0;
  const maxFeePerGas = BN.max(result?.fast.max || 0, priorityFeePerGas);

  return {
    result,
    priorityFeePerGas,
    maxFeePerGas,
  };
};

export const useSendAndWaitForConfirmations = (
  web3?: Web3,
  chainId?: number,
  account?: string
) => {
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
      const gas = await getGasPrice(web3);

      setWeb3Instance(web3);
      await sendAndWaitForConfirmations(
        tx,
        {
          from: account!,
          maxFeePerGas: gas?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.priorityFeePerGas,
          value,
        },
        undefined,
        undefined,
        {
          onTxHash,
        }
      );
    },
    [web3, chainId, account]
  );
};
