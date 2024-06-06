import BN from "bignumber.js";
import { useLiquidityHubPersistedStore } from "../../store/main";
import { LH_CONTROL } from "../../type";
import { useMemo } from "react";
export const useSwapRoute = ({
  isDisabled,
  lhAmountOut,
  dexAmountOut,
}: {
  isDisabled?: boolean;
  lhAmountOut?: string;
  dexAmountOut?: string;
}) => {
  const { lhControl } = useLiquidityHubPersistedStore((s) => ({
    lhControl: s.lhControl,
  }));
  return useMemo(() => {
    if (isDisabled) return "dex";
    if (new BN(dexAmountOut || "0").lte(0) && new BN(lhAmountOut || "0").lte(0))
      return;
    if (lhControl === LH_CONTROL.FORCE) {
      return "lh";
    }
    return new BN(lhAmountOut || "0").gt(new BN(dexAmountOut || "0"))
      ? "lh"
      : "dex";
  }, [isDisabled, lhControl, lhAmountOut, dexAmountOut]);
};
