import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { Quote, SwapStatus } from "..";

export function usePriceChanged({
  quote,
  isOpen,
  swapStatus,
  initialQuote,
}: {
  quote?: Quote;
  isOpen?: boolean;
  swapStatus?: SwapStatus;
  initialQuote?: Quote;
}) {
  const enabled = isOpen && !swapStatus
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (!enabled) {
      setAcceptedAmountOut(undefined);
    }
  }, [enabled]);

  useEffect(() => {
    if (!acceptedAmountOut) {
      setAcceptedAmountOut(initialQuote?.minAmountOut);
    }
  }, [initialQuote, acceptedAmountOut]);

  const acceptChanges = useCallback(() => {
    setAcceptedAmountOut(quote?.minAmountOut);
  }, [setAcceptedAmountOut, quote?.minAmountOut]);

  const shouldAccept = useMemo(() => {
    if (
      !acceptedAmountOut ||
      BN(acceptedAmountOut || 0).isZero() ||
      !quote?.minAmountOut ||
      BN(quote?.minAmountOut || 0).isZero() ||
      !enabled
    )
      return false;
    // if new price is less than the accepted price
    if (BN(quote.minAmountOut).isLessThan(BN(acceptedAmountOut))) {
      return true;
    }
  }, [acceptedAmountOut, quote?.minAmountOut, enabled]);

  return {
    shouldAccept,
    acceptChanges,
  };
}
