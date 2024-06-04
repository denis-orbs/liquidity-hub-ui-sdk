import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import BN from "bignumber.js";
import { useFormatNumber } from "../..";
import { useDexState } from "../../store/dex";

export const useRate = (inTokenUsd?: string | number,outTokenUsd?: string | number, defaultInverted?: boolean) => {
  const [inverted, setInverted] = useState(defaultInverted);
  const store = useDexState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );


  const value = useMemo(() => {
    if (!inTokenUsd || !outTokenUsd) return "";

    if (!inverted) {
      return BN(inTokenUsd).dividedBy(outTokenUsd).toString();
    }
    return BN(outTokenUsd).dividedBy(inTokenUsd).toString();
  }, [inverted, inTokenUsd, outTokenUsd]);

  const formattedRate = useFormatNumber({ value });

  const leftToken = inverted ? store.toToken?.symbol : store.fromToken?.symbol;
  const rightToken = inverted ? store.fromToken?.symbol : store.toToken?.symbol;

  const usd = useFormatNumber({
    value: BN((inverted ? inTokenUsd : outTokenUsd) || 0)
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
