import { useSwapState } from "../store/main";
import { useMemo } from "react";
import BN from "bignumber.js";
import { useQuote } from "./useQuote";
import { useShallow } from "zustand/react/shallow";
import { amountUi } from "../util";
import { useOutAmount } from "./useOutAmount";

export function useUsdValues() {
  const store = useSwapState(
    useShallow((s) => ({
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd,
      fromToken: s.fromToken,
      fromAmount: s.fromAmount,
      toToken: s.toToken,
    }))
  );

  const quote = useQuote();
  console.log(quote.data);
  
  const inTokenUsd = useMemo(() => {
    return BN(store.fromTokenUsd || 0).gt(0)
      ? store.fromTokenUsd
      : quote?.data?.inTokenUsd;
  }, [store.fromTokenUsd, quote?.data?.inTokenUsd]);

  const outTokenUsd = useMemo(() => {
    return BN(store.toTokenUsd || 0).gt(0)
      ? store.toTokenUsd
      : quote?.data?.outTokenUsd;
  }, [store.toTokenUsd, quote?.data?.outTokenUsd]);

  const outAmount = useOutAmount();

  const inAmountUsd = useMemo(() => {
    return BN(inTokenUsd || "0")
      .times(amountUi(store.fromToken?.decimals, BN(store.fromAmount || "0")))
      .toString();
  }, [inTokenUsd, store.fromAmount, store.fromToken]);

  const outAmountUsd = useMemo(() => {
    return BN(outTokenUsd || "0")
      .times(amountUi(store.toToken?.decimals, BN(outAmount || "0")))
      .toString();
  }, [outTokenUsd, outAmount, store.toToken]);


  return {
    inTokenUsd,
    outTokenUsd,
    inAmountUsd,
    outAmountUsd,
  };
}
