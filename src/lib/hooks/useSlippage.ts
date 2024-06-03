import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import BN from "bignumber.js";
export function useSlippage() {
    const contextSlippage = useMainContext().slippage;
    const storeSlippage = useSwapState(useShallow((s) => s.slippage));
    const slippage = storeSlippage || contextSlippage;
  
    return useMemo(() => {
      if (!slippage) return 0;
      return BN(slippage).isNaN() ? 0 : slippage;
    }, [slippage]);
  }
  