import { amountBN } from "../util";
import { useMemo } from "react";

export const useAmountBN = (
  decimals?: number,
  value?: string,
) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountBN(decimals, value).toString();
  }, [decimals, value]);

};
