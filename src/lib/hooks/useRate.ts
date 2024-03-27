import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { useQuote } from "./useQuote";

export const useRate = () => {
  const [inverted, setInverted] = useState(false);
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );

  const quote = useQuote().data;

  const value = useMemo(() => {
    if (!quote || !quote?.inTokenUsd || !quote.outTokenUsd) return "";

    if (!inverted) {
      return BN(quote?.inTokenUsd).dividedBy(quote.outTokenUsd).toString();
    }
    return BN(quote.outTokenUsd).dividedBy(quote?.inTokenUsd).toString();
  }, [quote, inverted]);

  const formattedRate = useFormatNumber({ value });

  const leftToken = inverted ? store.toToken?.symbol : store.fromToken?.symbol;
  const rightToken = inverted ? store.fromToken?.symbol : store.toToken?.symbol;

  const usd = useFormatNumber({
    value: BN((inverted ? quote?.inTokenUsd : quote?.outTokenUsd) || 0)
      .multipliedBy(value)
      .toString(),
  });

  return {
    leftToken: leftToken || '',
    rightToken: rightToken || '',
    usd: usd || '',
    value: formattedRate || '',
    invert: () => setInverted(!inverted),
  };
};
