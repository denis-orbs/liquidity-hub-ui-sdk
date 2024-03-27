import  { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useQuote } from "./useQuote";

export function useOutAmount() {
  const quote = useQuote().data;
  const dexExpectedAmountOut = useSwapState(
    useShallow((s) => s.dexExpectedAmountOut)
  );
  return useMemo(() => {
    if (dexExpectedAmountOut) {
      return dexExpectedAmountOut;
    }
    return quote?.outAmountMinusGas;
  }, [quote?.outAmountMinusGas, dexExpectedAmountOut]);
}

