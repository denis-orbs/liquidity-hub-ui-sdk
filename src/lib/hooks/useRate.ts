import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { useUsdValues } from "./useUsdValues";

export const useRate = () => {
  const [inverted, setInverted] = useState(false);
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );

  const { inTokenUsd, outTokenUsd } = useUsdValues();

  const value = useMemo(() => {
    if (!inTokenUsd || !outTokenUsd) return "";

    if (!inverted) {
      return BN(inTokenUsd).dividedBy(outTokenUsd).toString();
    }
    return BN(outTokenUsd).dividedBy(inTokenUsd).toString();
  }, [inTokenUsd, outTokenUsd, inverted]);

  const formattedRate = useFormatNumber({ value });

  const leftToken = inverted ? store.toToken?.symbol : store.fromToken?.symbol;
  const rightToken = inverted ? store.fromToken?.symbol : store.toToken?.symbol;

  const usd = useFormatNumber({
    value: BN((inverted ? inTokenUsd : outTokenUsd) || 0)
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
