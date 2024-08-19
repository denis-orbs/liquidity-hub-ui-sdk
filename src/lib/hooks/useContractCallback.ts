import { useMemo } from "react";
import { getContract, getWethContract } from "../util";

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
  return useMemo(() => {
    return getWethContract(web3, chainId);
  }, [web3, chainId]);
};
