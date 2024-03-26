import { useMemo } from "react";
import { useUsdValues } from "./useUsdValues";
import BN from "bignumber.js";
export function usePriceImpact() {
  const values = useUsdValues();

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
