import BN from "bignumber.js";
import { useLiquidityHubPersistedStore } from "../../store/main";
import { LH_CONTROL, TradeOwner } from "../../type";
import { useMemo } from "react";

export const useSwapRoute = (
  lhAmountOut?: string,
  dexAmountOut?: string,
  disabled?: boolean
): TradeOwner | undefined => {
  const { liquidityHubEnabled, lhControl } = useLiquidityHubPersistedStore(
    (s) => ({
      liquidityHubEnabled: s.liquidityHubEnabled,
      lhControl: s.lhControl,
    })
  );
  
  return useMemo(() => {
    if (disabled) return "dex";
    if (new BN(dexAmountOut || "0").lte(0) && new BN(lhAmountOut || "0").lte(0))
      return;

    if (lhControl === LH_CONTROL.SKIP || !liquidityHubEnabled) {
      return "dex";
    }
    if (lhControl === LH_CONTROL.FORCE) {
      return "lh";
    }
    return new BN(lhAmountOut || "0").gt(new BN(dexAmountOut || "0"))
      ? "lh"
      : "dex";
  }, [
    dexAmountOut,
    lhAmountOut,
    lhControl,
    disabled,
    liquidityHubEnabled,
  ]);
};
