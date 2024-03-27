import { useMemo } from "react";
import { zeroAddress } from "viem";
import { Token } from "../type";
import { isNativeAddress } from "../util";
import { useChainConfig } from "./useChainConfig";

export const useHandleTokenAddresses = (fromToken?: Token, toToken?: Token) => {
    const wTokenAddress = useChainConfig()?.wToken?.address;
  
    return useMemo(() => {
      return {
        fromAddress: isNativeAddress(fromToken?.address || "")
          ? wTokenAddress
          : fromToken?.address,
        toAddress: isNativeAddress(toToken?.address || "")
          ? zeroAddress
          : toToken?.address,
      };
    }, [fromToken?.address, toToken?.address, wTokenAddress]);
  };
  