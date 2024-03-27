import { useSwapState } from "../store/main";
import { useMemo } from "react";
import BN from "bignumber.js";
import { useQuote } from "./useQuote";
import { useShallow } from "zustand/react/shallow";
import { amountUi } from "../util";
import { useOutAmount } from "./useOutAmount";

export function useTotalUsdValues() {
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      fromAmount: s.fromAmount,
      toToken: s.toToken,
    }))
  );

  const quote = useQuote();
  const inTokenUsd = quote?.data?.inTokenUsd;
  const outTokenUsd = quote?.data?.outTokenUsd;
  const outAmount = useOutAmount().ui;

  const inAmountUsd = useMemo(() => {
    if (!inTokenUsd || !store.fromAmount) return;
    return BN(inTokenUsd || "")
      .times(amountUi(store.fromToken?.decimals, BN(store.fromAmount || "0")))
      .toString();
  }, [inTokenUsd, store.fromAmount, store.fromToken]);

  const outAmountUsd = useMemo(() => {
    if (!outTokenUsd || !outAmount) return;
    return BN(outTokenUsd || "")
      .times(outAmount)
      .toString();
  }, [outTokenUsd, outAmount, store.toToken]);

  return {
    inAmountUsd,
    outAmountUsd,
    isLoading: quote.isLoading,
  };
}
