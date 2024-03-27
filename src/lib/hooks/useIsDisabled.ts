import { useShallow } from "zustand/react/shallow";
import { useMainContext } from "../provider";
import { useLiquidityHubPersistedStore, useSwapState } from "../store/main";
import { useIsInvalidChain } from "./useIsInvalidChain";

export function useIsDisabled() {
  const maxFailures = useMainContext().maxFailures;
  const invalidChain = useIsInvalidChain();
  const liquidityHubEnabled = useLiquidityHubPersistedStore(
    (s) => s.liquidityHubEnabled
  );
  const { failures, disabledByDex } = useSwapState(
    useShallow((s) => ({
      failures: s.failures,
      disabledByDex: s.disabledByDex,
    }))
  );

  const failedMaxFailures = !maxFailures ? false : (failures || 0) >= maxFailures;


  return failedMaxFailures || invalidChain || disabledByDex || !liquidityHubEnabled;
}
