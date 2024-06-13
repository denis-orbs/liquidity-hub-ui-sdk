import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useMainContext } from "../../provider";
import { approve } from "../../swap/approve";
import { isNativeAddress } from "../../util";
import { useChainConfig } from "../useChainConfig";
import { useEstimateGasPrice } from "../useEstimateGasPrice";
import { useAllowance } from "./useAllowance";

export function useApprove(inTokenAddress?: string, fromAmount?: string) {
  const { refetch } = useAllowance(inTokenAddress, fromAmount);
  const { web3, account, chainId } = useMainContext();
  const [txHash, setTxHash] = useState<string>("");
  const gas = useEstimateGasPrice();
  const wToken = useChainConfig()?.wToken.address;
  const mutation = useMutation({
    mutationFn: async () => {
      if (!inTokenAddress) {
        throw new Error("No token address found");
      }
      if (!account) {
        throw new Error("No account found");
      }
      if (!web3) {
        throw new Error("Web3 not found");
      }
      if (!chainId) {
        throw new Error("Chain ID not found");
      }
      if (!gas) {
        throw new Error("Gas not found");
      }

      const fromToken = isNativeAddress(inTokenAddress)
        ? wToken
        : inTokenAddress;

      if (!fromToken) {
        throw new Error("Token not found");
      }

      return approve({
        account,
        web3,
        chainId,
        fromToken,
        gas,
        onTxHash: (approveTxHash) => {
          setTxHash(approveTxHash);
        },
      });
    },
    onSettled: () => {
      refetch();
    },
  });

  return {
    ...mutation,
    txHash,
  };
}
