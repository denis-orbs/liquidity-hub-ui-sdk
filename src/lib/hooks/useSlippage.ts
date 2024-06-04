import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import BN from "bignumber.js";
export function useSlippage() {
    const slippage = useSwapState(useShallow((s) => s.slippage));
  
    return useMemo(() => {
      if (!slippage) return 0;
      return BN(slippage).isNaN() ? 0 : slippage;
    }, [slippage]);
  }
  