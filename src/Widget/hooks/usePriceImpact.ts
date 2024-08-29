import BN from "bignumber.js";
import { useMemo } from "react";
import { useWidgetContext } from "../context";
import { amountUi, useAmountBN } from "../../lib";
export function usePriceImpact(
  inTokenUsd?: string | number,
  outTokenUsd?: string | number,
  outAmount?: string
) {
  const { state:{fromToken, toToken, fromAmountUi} } = useWidgetContext()

  const fromAmount = useAmountBN(fromToken?.decimals, fromAmountUi);

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
