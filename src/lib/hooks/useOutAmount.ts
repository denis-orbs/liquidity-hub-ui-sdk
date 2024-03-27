import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useQuote } from "./useQuote";

export function useOutAmount() {
  const quote = useQuote().data;
  const { dexExpectedAmountOut, toToken } = useSwapState(
    useShallow((s) => ({
      dexExpectedAmountOut: s.dexExpectedAmountOut,
      toToken: s.toToken,
    }))
  );
  const value = useMemo(() => {      
    if (dexExpectedAmountOut) {
      return dexExpectedAmountOut;
    }
    return quote?.outAmount;
  }, [quote?.outAmount, dexExpectedAmountOut]);

  return {
    value,
    ui: useAmountUI(toToken?.decimals, value),
  };
}
