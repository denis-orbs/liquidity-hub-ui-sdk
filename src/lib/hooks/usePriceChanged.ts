import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { useAmountUI } from "./useAmountUI";
import { ActionStatus, QuoteResponse, Token } from "..";


export function usePriceChanged({
  quote,
  showConfirmationModal,
  toToken,
  originalQuote,
  swapStatus,
}: {
  quote?: QuoteResponse;
  showConfirmationModal?: boolean;
  toToken?: Token;
  originalQuote?: QuoteResponse;
  swapStatus?: ActionStatus;
}) {
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    // initiate
    if (showConfirmationModal && !acceptedAmountOut) {
      setAcceptedAmountOut(originalQuote?.minAmountOut);
    }
  }, [originalQuote, acceptedAmountOut, showConfirmationModal]);

  const acceptChanges = useCallback(() => {
    setAcceptedAmountOut(quote?.minAmountOut);
  }, [setAcceptedAmountOut, quote?.minAmountOut]);

  const shouldAccept = useMemo(() => {
    if (
      !acceptedAmountOut ||
      BN(acceptedAmountOut || 0).isZero() ||
      !quote?.minAmountOut ||
      BN(quote?.minAmountOut || 0).isZero() || 
      swapStatus
    )
      return false;

    if (BN(quote.minAmountOut).isLessThan(BN(acceptedAmountOut))) {      
      return true;
    }
  }, [acceptedAmountOut, quote?.minAmountOut, swapStatus]);

  return {
    shouldAccept,
    acceptChanges,
    newPrice: useAmountUI(toToken?.decimals, quote?.minAmountOut),
  };
}
