import { useMemo } from "react";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useAmountUI } from "./useAmountUI";
import { useSwapState } from "../store/main";
import { useShallow } from "zustand/react/shallow";

export function useGasCost() {
  const { data: quote, isLoading } = useQuote();
  const toToken = useSwapState(useShallow((s) => s.toToken));

  const gasCostOutputToken = quote?.gasCostOutputToken;

  const price = useMemo(() => {
    if (!gasCostOutputToken || !quote.outTokenUsd) return "";
    return BN(gasCostOutputToken).multipliedBy(quote.outTokenUsd).toString();
  }, [gasCostOutputToken, quote]);

  return {
    price,
    priceUi: useAmountUI(toToken?.decimals, price),
    isLoading,
  };
}
