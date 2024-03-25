import { amountUi } from "../util";
import { useMemo } from "react";
import BN from "bignumber.js";

export const useAmountUI = (decimals?: number, value?: string | number) => {
  const result = useMemo(() => {
    if (!decimals || !value) return "";
    return amountUi(decimals, new BN(value));
  }, [decimals, value]);

  return result;
};
