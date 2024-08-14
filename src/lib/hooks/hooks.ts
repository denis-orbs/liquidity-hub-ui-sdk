import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { getChainConfig } from "../util";

export function useWrapOrUnwrapOnly(
  fromTokenAddress?: string,
  toTokenAddress?: string,
  chainId?: number
) {
  return useMemo(() => {
    const wTokenAddress = getChainConfig(chainId)?.wToken?.address;

    return {
      isWrapOnly: (
        eqIgnoreCase(wTokenAddress || "", toTokenAddress || "") &&
        isNativeAddress(fromTokenAddress || "")
      ),
      isUnwrapOnly: (
        eqIgnoreCase(wTokenAddress || "", fromTokenAddress || "") &&
        isNativeAddress(toTokenAddress || "")
      )
    };
  }, [chainId, fromTokenAddress, toTokenAddress]);
}


