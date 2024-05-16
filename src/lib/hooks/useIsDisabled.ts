import { useMainContext } from "../provider";
import { useLiquidityHubPersistedStore } from "../store/main";
import { useIsInvalidChain } from "./useIsInvalidChain";

export function useIsDisabled(failures: number, disabledByDex?: boolean) {
  const maxFailures = useMainContext().maxFailures;
  const invalidChain = useIsInvalidChain();
  const liquidityHubEnabled = useLiquidityHubPersistedStore(
    (s) => s.liquidityHubEnabled
  );
 

  const failedMaxFailures = !maxFailures ? false : (failures || 0) >= maxFailures;


  return failedMaxFailures || invalidChain || disabledByDex || !liquidityHubEnabled;
}
