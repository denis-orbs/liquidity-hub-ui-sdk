import { useMemo } from "react";
import { useMainContext } from "../context/MainContext";
import { isNativeAddress } from "../util";
import { useAllowance } from "./swap";

export function useSwapButtonContent() {
  const { data: hasAllowance } = useAllowance();
  const {
    state: { fromToken },
  } = useMainContext();
  const fromTokenAddress = fromToken?.address;

  return useMemo(() => {
    if (isNativeAddress(fromTokenAddress || "")) return "Wrap and Swap";
    if (!hasAllowance) return "Approve and Swap";
    return "Sign and Swap";
  }, [fromTokenAddress, hasAllowance]);
}
