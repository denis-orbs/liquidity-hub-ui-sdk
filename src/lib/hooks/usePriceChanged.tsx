import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { useSwapState } from "../store/main";
import { useShallow } from "zustand/react/shallow";
import { useAmountUI } from "./useAmountUI";
import { useQuote } from "..";

export function usePriceChanged() {
  const quote = useQuote().data;
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);
  const { showConfirmation, toToken, originalQuote, swapStatus } = useSwapState(
    useShallow((s) => ({
      showConfirmation: s.showConfirmation,
      toToken: s.toToken,
      originalQuote: s.originalQuote,
      swapStatus: s.swapStatus,
    }))
  );

  useEffect(() => {
    // initiate
    if (showConfirmation && !acceptedAmountOut) {
      setAcceptedAmountOut(originalQuote?.minAmountOut);
    }
  }, [originalQuote, acceptedAmountOut, showConfirmation]);

  const acceptChanges = useCallback(() => {
    setAcceptedAmountOut(quote?.minAmountOut);
  }, [setAcceptedAmountOut, quote?.minAmountOut]);

  const shouldAccept = useMemo(() => {
    if (!acceptedAmountOut || !quote?.minAmountOut || swapStatus) return false;

    if (BN(quote.minAmountOut).isLessThan(BN(acceptedAmountOut))) {
      return true;
    }
  }, [acceptedAmountOut, quote?.minAmountOut, swapStatus]);

  return {
    shouldAccept,
    acceptChanges,
    updatePrice: useAmountUI(toToken?.decimals, quote?.minAmountOut),
  };
}
