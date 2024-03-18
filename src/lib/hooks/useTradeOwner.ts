import BN from "bignumber.js";
import { useLiquidityHubPersistedStore } from "../store/main";
import { LH_CONTROL, TradeOwner } from "../type";
import { useMemo } from "react";
import { useIsDisabled } from "./useIsDisabled";
export const useTradeOwner = (
  lhOutAmount?: string,
  dexMinAmountOut?: string,
): TradeOwner | undefined => {
  const disabled = useIsDisabled();
  const { liquidityHubEnabled, lhControl } = useLiquidityHubPersistedStore(
    (s) => ({
      liquidityHubEnabled: s.liquidityHubEnabled,
      lhControl: s.lhControl,
    })
  );
  return useMemo(() => {
    if (disabled) return "dex";
    if (new BN(dexMinAmountOut || "0").lte(0) && new BN(lhOutAmount || "0").lte(0))
      return;

    if (lhControl === LH_CONTROL.SKIP || !liquidityHubEnabled) {
      return "dex";
    }
    if (lhControl === LH_CONTROL.FORCE) {
      console.log("LH force mode on");
      return "lh";
    }
    return new BN(lhOutAmount || "0").gt(new BN(dexMinAmountOut || "0"))
      ? "lh"
      : "dex";
  }, [
    dexMinAmountOut,
    lhOutAmount,
    lhControl,
    disabled,
    liquidityHubEnabled,
  ]);
};
