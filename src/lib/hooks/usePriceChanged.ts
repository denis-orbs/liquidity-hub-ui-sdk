import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { useAmountUI } from "./useAmountUI";
import { ActionStatus, QuoteResponse, Token } from "..";

export function usePriceChanged({
  quote,
  showConfirmationModal,
  toToken,
  initialQuote,
  swapStatus,
}: {
  quote?: QuoteResponse;
  showConfirmationModal?: boolean;
  toToken?: Token;
  initialQuote?: QuoteResponse;
  swapStatus?: ActionStatus;
}) {
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    // initiate
    if (!showConfirmationModal) {
      setAcceptedAmountOut(undefined);
    }
    if (!acceptedAmountOut) {
      setAcceptedAmountOut(initialQuote?.minAmountOut);
    }
  }, [initialQuote, acceptedAmountOut, showConfirmationModal]);

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
    // if new price is less than the accepted price
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
