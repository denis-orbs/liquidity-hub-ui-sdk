import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useQuote } from "./useQuote";

export const useQuotePayload = () => {
  const { fromToken, toToken, fromAmount, dexMinAmountOut } =
    useSwapState(
      useShallow((s) => ({
        fromToken: s.fromToken,
        toToken: s.toToken,
        fromAmount: s.fromAmount,
        dexMinAmountOut: s.dexMinAmountOut,
      }))
    );
  return useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexMinAmountOut,
  });
};
