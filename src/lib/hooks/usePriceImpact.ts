import { useMemo } from "react";
import BN from "bignumber.js";
import { useTotalUsdValues } from "./useTotalUsdValues";
export function usePriceImpact() {
  const values = useTotalUsdValues();

  return useMemo(() => {
    console.log(
      new BN(values.outAmountUsd || "0")
        .div(values.inAmountUsd || "0")
        .minus(1)
        .times(100)
        .absoluteValue()
        .toString()
    );

    if (!values.outAmountUsd || !values.inAmountUsd) return "";
    return new BN(values.outAmountUsd || "0")
      .div(values.inAmountUsd || "0")
      .minus(1)
      .times(100)
      .toString();
  }, [values.inAmountUsd, values.outAmountUsd]);
}
