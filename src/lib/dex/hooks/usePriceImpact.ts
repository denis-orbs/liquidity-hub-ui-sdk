import { useShallow } from "zustand/react/shallow";
import { useDexState } from "../../store/dex";
import BN from "bignumber.js";
import { useMemo } from "react";
import { amountUi, useAmountBN } from "../..";
export function usePriceImpact(
  inTokenUsd?: string | number,
  outTokenUsd?: string | number,
  outAmount?: string
) {
  const { fromAmountUI, fromToken, toToken } = useDexState(
    useShallow((it) => ({
      fromAmountUI: it.fromAmount,
      fromToken: it.fromToken,
      toToken: it.toToken,
    }))
  );

  const fromAmount = useAmountBN(fromToken?.decimals, fromAmountUI);

  return useMemo(() => {
    if (
      !inTokenUsd ||
      !outTokenUsd ||
      !outAmount ||
      !fromAmount ||
      BN(inTokenUsd || "0").isZero() ||
      BN(outTokenUsd || "0").isZero() ||
      BN(outAmount || "0").isZero() ||
      BN(fromAmount || "0").isZero()
    ) {
      return;
    }

    const inTokenUsdAmount = BN(
      amountUi(fromToken?.decimals, BN(fromAmount))
    ).multipliedBy(inTokenUsd);
    const outTokenUsdAmount = BN(
      amountUi(toToken?.decimals, BN(outAmount))
    ).multipliedBy(outTokenUsd);

    return outTokenUsdAmount
      .div(inTokenUsdAmount)
      .minus(1)
      .times(100)
      .toString();
  }, [inTokenUsd, outTokenUsd, outAmount, fromAmount]);
}
