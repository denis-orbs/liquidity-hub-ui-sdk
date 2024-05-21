import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMainContext } from "../provider";
import { useLiquidityHubPersistedStore, useSwapState } from "../store/main";
import { LH_CONTROL } from "../type";
import { useIsInvalidChain } from "./useIsInvalidChain";

export function useIsDisabled() {
  const maxFailures = useMainContext().maxFailures;
  const invalidChain = useIsInvalidChain();
  const { liquidityHubEnabled, lhControl } = useLiquidityHubPersistedStore(
    (s) => ({
      liquidityHubEnabled: s.liquidityHubEnabled,
      lhControl: s.lhControl,
    })
  );

  const { failures, disabledByDex } = useSwapState(
    useShallow((s) => ({
      failures: s.failures,
      disabledByDex: s.disabledByDex,
    }))
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
