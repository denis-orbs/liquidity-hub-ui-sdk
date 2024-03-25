import { useMemo } from "react";
import { useUsdValues } from "./useUsdValues";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";

export function usePriceImpact(amountsDecimalScale: number = 8) {
  const values = useUsdValues();

  const inAmountUsd = useFormatNumber({
    value: values.inAmountUsd,
    decimalScale: amountsDecimalScale,
  });
  const outAmountUsd = useFormatNumber({
    value: values.outAmountUsd,
    decimalScale: amountsDecimalScale,
  });

  return useMemo(() => {
    if(!outAmountUsd || !inAmountUsd) return ''
    return new BN(outAmountUsd || "0")
      .div(inAmountUsd || "0")
      .minus(1)
      .times(100)
      .absoluteValue()
      .toString();
  }, [inAmountUsd, outAmountUsd]);
}
