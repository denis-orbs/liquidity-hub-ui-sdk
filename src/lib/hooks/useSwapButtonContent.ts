import { useMemo } from "react";
import { isNativeAddress } from "../util";
import { useAllowance } from "./swap";

export function useSwapButtonContent(
  fromTokenAddress?: string,
  fromAmount?: string
) {
  const { data: hasAllowance } = useAllowance(fromTokenAddress, fromAmount);
  
  return useMemo(() => {
    if (isNativeAddress(fromTokenAddress || "")) return "Wrap and Swap";
    if (!hasAllowance) return "Approve and Swap";
    return "Sign and Swap";
  }, [fromTokenAddress, hasAllowance]);
}
