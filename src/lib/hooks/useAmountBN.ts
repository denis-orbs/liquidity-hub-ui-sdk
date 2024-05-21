import { amountBN } from "../util";
import { useMemo } from "react";

export const useAmountBN = (
  decimals?: number,
  value?: string,
) => {
  return useMemo(() => {
    if (!decimals || !value) return "0";
    return amountBN(decimals, value).toFixed();
  }, [decimals, value]);

};
