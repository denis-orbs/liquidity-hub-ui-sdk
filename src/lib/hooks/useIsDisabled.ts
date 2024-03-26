import { useShallow } from "zustand/react/shallow";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useIsInvalidChain } from "./useIsInvalidChain";

export function useIsDisabled() {
  const maxFailures = useMainContext().maxFailures;
  const invalidChain = useIsInvalidChain();
  const { failures, disabledByDex } = useSwapState(
    useShallow((s) => ({
      failures: s.failures,
      disabledByDex: s.disabledByDex,
    }))
  );

  const failed = !maxFailures ? false :  (failures || 0) > maxFailures;

  return failed || invalidChain || disabledByDex;
}
