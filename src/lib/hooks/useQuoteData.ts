import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useQuote } from "./useQuote";

export const useQuotePayload = () => {
  const { fromToken, toToken, fromAmount, dexAmountOut } =
    useSwapState(
      useShallow((s) => ({
        fromToken: s.fromToken,
        toToken: s.toToken,
        fromAmount: s.fromAmount,
        dexAmountOut: s.dexAmountOut,
      }))
    );
  return useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexAmountOut,
  });
};
