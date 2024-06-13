import { useMemo } from "react";
import { eqIgnoreCase, isNativeAddress } from "../util";
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
