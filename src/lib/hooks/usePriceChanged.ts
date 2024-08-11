import { useMemo } from "react";
import BN from "bignumber.js";
import { SwapStatus } from "..";

export function usePriceChanged({
  newPrice,
  isOpen,
  swapStatus,
  acceptedPrice,
}: {
  newPrice?: string;
  isOpen?: boolean;
  swapStatus?: SwapStatus;
  acceptedPrice?: string;
}) {
  const enabled = isOpen && !swapStatus;

  return useMemo(() => {
    if (
      !acceptedPrice ||
      BN(acceptedPrice || 0).isZero() ||
      !newPrice ||
      BN(newPrice || 0).isZero() ||
      !enabled
    )
      return false;
    // if new price is less than the accepted price
    if (BN(newPrice).isLessThan(BN(acceptedPrice))) {
      return true;
    }
  }, [newPrice, acceptedPrice, enabled]);
}
