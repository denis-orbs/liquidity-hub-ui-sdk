import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useChainConfig } from "./useChainConfig";

export function useWrapOrUnwrapOnly(
  fromTokenAddress?: string,
  toTokenAddress?: string
) {
  const wTokenAddress = useChainConfig()?.wToken?.address;
  return useMemo(() => {
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
  }, [wTokenAddress, fromTokenAddress, toTokenAddress]);
}


