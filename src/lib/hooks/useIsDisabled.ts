import { useMemo } from "react";
import { useMainContext } from "../provider";
import { useLiquidityHubPersistedStore } from "../store/main";
import { LH_CONTROL } from "../type";
import { useIsInvalidChain } from "./useIsInvalidChain";

export function useIsDisabled({failures, disabledByDex}: {failures?: number; disabledByDex?: boolean}) {
  const maxFailures = useMainContext().swap?.maxFailures;
  const invalidChain = useIsInvalidChain();
  const { liquidityHubEnabled, lhControl } = useLiquidityHubPersistedStore(
    (s) => ({
      liquidityHubEnabled: s.liquidityHubEnabled,
      lhControl: s.lhControl,
    })
  );


  const failedMaxFailures = !maxFailures
    ? false
    : (failures || 0) >= maxFailures;

  return useMemo(() => {
    if (!liquidityHubEnabled) return true;
    if (lhControl === LH_CONTROL.SKIP) return true;
    return (
      failedMaxFailures || invalidChain || disabledByDex || !liquidityHubEnabled
    );
  }, [
    failedMaxFailures,
    invalidChain,
    disabledByDex,
    lhControl,
    liquidityHubEnabled,
  ]);
}
