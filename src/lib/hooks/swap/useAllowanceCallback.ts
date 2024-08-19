import { Token, useContract } from "../..";
import BN from "bignumber.js";
import { useCallback } from "react";
import { permit2Address } from "@defi.org/web3-candies";
import Web3 from "web3";

export const useAllowanceCallback = (
  account?: string,
  web3?: Web3,
  chainId?: number,
  fromAmount?: string,
  fromToken?: Token
) => {
  const fromTokenContract = useContract(fromToken?.address, web3, chainId);  
  return useCallback(async () => {
    let allowance = "0";
   try {
    allowance = await fromTokenContract?.methods
    ?.allowance(account, permit2Address)
    .call();
   } catch (error) {
    console.error("Error getting allowance  ", error);
   }

  
      

    return BN(allowance?.toString() || "0").gte(fromAmount!);
  }, [fromTokenContract, account, fromToken?.address, fromAmount]);
};

