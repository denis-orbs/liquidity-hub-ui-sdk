import BN from "bignumber.js";
import { useLiquidityHubPersistedStore } from "../../store/main";
import { LH_CONTROL, SwapRoute } from "../../type";
import { useMemo } from "react";
import { useIsDisabled } from "../useIsDisabled";
export const useSwapRoute = (
  lhAmountOut?: string,
  dexAmountOut?: string
): SwapRoute | undefined => {
  const disabled = useIsDisabled();

  const { lhControl } = useLiquidityHubPersistedStore((s) => ({
    lhControl: s.lhControl,
  }));
  return useMemo(() => {
    if (disabled) return "dex";
    if (new BN(dexAmountOut || "0").lte(0) && new BN(lhAmountOut || "0").lte(0))
      return;
    if (lhControl === LH_CONTROL.FORCE) {
      return "lh";
    }
    return new BN(lhAmountOut || "0").gt(new BN(dexAmountOut || "0"))
      ? "lh"
      : "dex";
  }, [dexAmountOut, lhAmountOut, lhControl, disabled]);
};
