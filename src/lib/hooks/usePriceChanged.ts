import { useMemo } from "react";
import BN from "bignumber.js";

export function usePriceChanged(newPrice?: string, acceptedPrice?: string) {
  return useMemo(() => {
    if (
      !acceptedPrice ||
      BN(acceptedPrice || 0).isZero() ||
      !newPrice ||
      BN(newPrice || 0).isZero()
    )
      return false;
    return BN(newPrice).isLessThan(BN(acceptedPrice));
  }, [newPrice, acceptedPrice]);
}
