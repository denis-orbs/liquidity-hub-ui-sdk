import { useCallback, useMemo } from "react";
import { useChainConfig } from "./useChainConfig";
import { getContract } from "../util";
import { useMainContext } from "../context/MainContext";
import { zeroAddress } from "@defi.org/web3-candies";

export const useContractCallback = () => {
  const { web3, chainId } = useMainContext();

  return useCallback(
    (address?: string) => {
      return getContract(address, web3, chainId);
    },
    [web3, chainId]
  );
};

export const useContract = (address?: string) => {
  const { web3, chainId } = useMainContext();
  const wethAddress = useChainConfig()?.wToken?.address;

  return useMemo(() => {
    return getContract(address, web3, chainId);
  }, [web3, wethAddress, chainId, address]);
};

export const useWethContract = () => {
  return useContract(zeroAddress);
};
