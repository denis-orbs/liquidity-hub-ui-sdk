import { useMemo, useState } from "react";
import { useFormatNumber } from "../hooks";
import BN from "bignumber.js";
import { useSwapState } from "../store/main";
import { useShallow } from "zustand/react/shallow";

export function usePriceCompare() {
  const { fromToken, toToken, fromTokenUsd, toTokenUsd } = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd,
    }))
  );
  const [inverted, setInvert] = useState(false);

  const leftToken = inverted ? toToken : fromToken;
  const rightToken = inverted ? fromToken : toToken;

  const leftSideTokenUsd = inverted ? toTokenUsd : fromTokenUsd;
  const rightSideTokenUsd = inverted ? fromTokenUsd : toTokenUsd;

  const toAmount = useMemo(() => {
    if (!leftSideTokenUsd || !rightSideTokenUsd) return 0;
    return BN(leftSideTokenUsd).dividedBy(rightSideTokenUsd).toString();
  }, [leftSideTokenUsd, rightSideTokenUsd]);

  const rightTokenUsdAmount = useMemo(() => {
    if (!rightSideTokenUsd) return 0;
    return BN(rightSideTokenUsd).multipliedBy(toAmount).toString();
  }, [rightSideTokenUsd, toAmount]);

  const _toAmount = useFormatNumber({ value: toAmount });
  const _rightTokenUsdAmount = useFormatNumber({ value: rightTokenUsdAmount });

  const onInvert = (e: any) => {
    e.stopPropagation();
    setInvert(!inverted);
  };

  return {
    toAmount: _toAmount,
    leftToken,
    rightToken,
    onInvert,
    rightTokenUsd: _rightTokenUsdAmount,
    leftTokenUsd: leftSideTokenUsd,
  };
}
