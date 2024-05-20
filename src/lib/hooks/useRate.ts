import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { useQuote } from "./swap/useQuote";

export const useRate = (defaultInverted: boolean = false) => {
  const [inverted, setInverted] = useState(defaultInverted);
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      inTokenUsd: s.inTokenUsd,
      outTokenUsd: s.outTokenUsd,
    }))
  );

  const quote = useQuote().data;

  const value = useMemo(() => {
    if (!quote || !store?.inTokenUsd || !store.outTokenUsd) return "";

    if (!inverted) {
      return BN(store?.inTokenUsd).dividedBy(store.outTokenUsd).toString();
    }
    return BN(store.outTokenUsd).dividedBy(store?.inTokenUsd).toString();
  }, [quote, inverted, store?.inTokenUsd, store.outTokenUsd]);

  const formattedRate = useFormatNumber({ value });

  const leftToken = inverted ? store.toToken?.symbol : store.fromToken?.symbol;
  const rightToken = inverted ? store.fromToken?.symbol : store.toToken?.symbol;

  const usd = useFormatNumber({
    value: BN((inverted ? store?.inTokenUsd : store?.outTokenUsd) || 0)
      .multipliedBy(value)
      .toString(),
  });

  return {
    leftToken,
    rightToken,
    usd,
    value: formattedRate,
    invert: () => setInverted(!inverted),
  };
};
