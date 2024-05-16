import { useCallback, useEffect, useState } from "react";
import BN from "bignumber.js";
import { useAmountUI } from "./useAmountUI";
import { Token } from "../type";

export function useAcceptedAmountOut(
  outAmount?: string,
  minAmountOut?: string,
  toToken?: Token,
  enabled?: boolean
) {
  const [isUpdated, setIsUpdated] = useState(false);
  const [acceptedAmountOut, setAcceptedAmountOut] = useState(outAmount);

  const accept = useCallback(() => {
    setIsUpdated(false);
    setAcceptedAmountOut(outAmount);
  }, [setIsUpdated, setAcceptedAmountOut, outAmount]);

  useEffect(() => {
    if (!outAmount || !minAmountOut || !enabled) return;
    if (!acceptedAmountOut) {
      setAcceptedAmountOut(outAmount);
      return;
    }
    if (BN(outAmount).gte(BN(acceptedAmountOut))) {
      return;
    }

    // price changed, and outAmount minus slippage is less than minAmountOut

    if (BN(outAmount).isLessThan(BN(minAmountOut))) {
      setIsUpdated(true);
    }
  }, [
    setIsUpdated,
    outAmount,
    minAmountOut,
    acceptedAmountOut,
    setAcceptedAmountOut,
    enabled,
  ]);

  return {
    shouldAccept: isUpdated,
    accept,
    amountToAccept: useAmountUI(toToken?.decimals, outAmount),
  };
}
