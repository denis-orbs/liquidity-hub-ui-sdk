import { useMemo } from "react";
import { getContract } from "../util";
import { zeroAddress } from "@defi.org/web3-candies";
import Web3 from "web3";


export const useContract = (
  address?: string,
  web3?: Web3,
  chainId?: number
) => {
  return useMemo(() => {
    return getContract(address, web3, chainId);
  }, [web3, chainId, address]);
};

export const useWethContract = (web3?: Web3, chainId?: number) => {
  return useContract(zeroAddress, web3, chainId);
};
