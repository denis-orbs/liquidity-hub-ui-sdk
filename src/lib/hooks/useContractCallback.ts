import erc20abi from "../abi/ERC20Abi.json";
import iwethabi from "../abi/IWETHAbi.json";

import {} from 'web3'
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useChainConfig } from "./useChainConfig";
import { isNativeAddress } from "../util";

export const useContractCallback = () => {
  const { web3 } = useMainContext();
  const wethAddress = useChainConfig()?.wToken?.address;

  return useCallback(
    (address?: string) => {
      if (!address || !web3 || !address.startsWith("0x")) return undefined;

      return new web3.eth.Contract(
        isNativeAddress(address) ? iwethabi : erc20abi as any,
        isNativeAddress(address) ? wethAddress : address
      );
    },
    [web3, wethAddress]
  );
};
