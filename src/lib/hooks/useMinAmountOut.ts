import { useMemo } from "react";
import { useMainContext } from "../provider";
import { useQuotePayload } from "./useQuoteData";
import BN from "bignumber.js";

export const useMinAmountOut = () => {
  const { slippage } = useMainContext();
  const toAmount = useQuotePayload().data?.outAmountUI;
  return useMemo(() => {
    if (!toAmount || !slippage) return "0";
    const _slippage = slippage / 2;
    return new BN(toAmount)
      .times(100 - _slippage)
      .div(100)
      .toString();
  }, [slippage, toAmount]);
};
