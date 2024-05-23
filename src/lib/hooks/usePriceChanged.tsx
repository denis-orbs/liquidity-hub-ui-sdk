import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { useSwapState } from "../store/main";
import { useShallow } from "zustand/react/shallow";
import { useAmountUI } from "./useAmountUI";
import { useQuote } from "..";
import { useSlippage } from "./swap/useSlippage";

export function usePriceChanged() {
  const [isUpdated, setIsUpdated] = useState(false);
  const quote = useQuote().data;
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);
  const slippage = useSlippage();
  const { showConfirmation, toToken, originalQuote } = useSwapState(
    useShallow((s) => ({
      showConfirmation: s.showConfirmation,
      toToken: s.toToken,
      originalQuote: s.originalQuote,
    }))
  );

  useEffect(() => {
    // initiate
    if (showConfirmation && !acceptedAmountOut) {
      setAcceptedAmountOut(originalQuote?.minAmountOut);
    }
  }, [originalQuote, acceptedAmountOut, showConfirmation]);

  const updatedAmount = useMemo(() => {
    if (!quote?.outAmount) return;
    const slippageTokenAmount = BN(quote?.outAmount).multipliedBy(
      BN(slippage).dividedBy(100)
    ).decimalPlaces(0).toFixed();
      
    return BN(quote?.outAmount).minus(slippageTokenAmount).toString();
  }, [slippage, quote?.outAmount]);
  
  const acceptChanges = useCallback(() => {
    setIsUpdated(false);
    setAcceptedAmountOut(updatedAmount);
  }, [setIsUpdated, setAcceptedAmountOut, updatedAmount]);

  useEffect(() => {
    if (!acceptedAmountOut || !updatedAmount) return;

    if (BN(updatedAmount).isLessThan(BN(acceptedAmountOut))) {
      setIsUpdated(true);
    }
  }, [setIsUpdated, setAcceptedAmountOut, acceptedAmountOut, updatedAmount]);

  return {
    shouldAccept: isUpdated,
    acceptChanges,
    updatePrice: useAmountUI(toToken?.decimals, updatedAmount),
  };
}
