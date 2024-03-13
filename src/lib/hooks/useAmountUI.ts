import { amountUi } from "../util";
import { useMemo } from "react";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";

export const useAmountUI = (
  decimals?: number,
  value?: string | number,
  decimalScale? : number
) => {
  const result = useMemo(() => {
    if (!decimals || !value) return "0";
    return amountUi(decimals, new BN(value));
  }, [decimals, value]);

  return useFormatNumber({ value: result, decimalScale });
};
