import { useMemo, useState } from "react";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { Token } from "../type";

export const useRate = ({
  defaultInverted = false,
  fromToken,
  toToken,
  inTokenUsd,
  outTokenUsd,
}:{
  defaultInverted: boolean,
  fromToken?: Token,
  toToken?: Token,
  inTokenUsd?: string,
  outTokenUsd?: string,
}) => {
  const [inverted, setInverted] = useState(defaultInverted);

  const value = useMemo(() => {
    if ( !inTokenUsd || !outTokenUsd) return "";

    if (!inverted) {
      return BN(inTokenUsd).dividedBy(outTokenUsd).toString();
    }
    return BN(outTokenUsd).dividedBy(inTokenUsd).toString();
  }, [inverted]);

  const formattedRate = useFormatNumber({ value });

  const leftToken = inverted ? toToken?.symbol : fromToken?.symbol;
  const rightToken = inverted ? fromToken?.symbol : toToken?.symbol;

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
