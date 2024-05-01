import { useCallback, useEffect, useState } from "react";
import BN from "bignumber.js";
import { useSwapState } from "../store/main";
import { useShallow } from "zustand/react/shallow";
import { useAmountUI } from "./useAmountUI";

export function useAcceptedAmountOut(
  outAmount?: string,
  minAmountOut?: string
) {
  const [isUpdated, setIsUpdated] = useState(false);
  const [acceptedAmountOut, setAcceptedAmountOut] = useState(outAmount);
  const { showConfirmation, toToken } = useSwapState(
    useShallow((s) => ({
      showConfirmation: s.showConfirmation,
      toToken: s.toToken,
    }))
  );

  const accept = useCallback(() => {
    setIsUpdated(false);
    setAcceptedAmountOut(outAmount);
  }, [setIsUpdated, setAcceptedAmountOut, outAmount]);

  useEffect(() => {
    if (!outAmount || !minAmountOut || !showConfirmation) return;
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
    showConfirmation,
  ]);

  return {
    shouldAccept: isUpdated,
    accept,
    amountToAccept: useAmountUI(toToken?.decimals, outAmount),
  };
}