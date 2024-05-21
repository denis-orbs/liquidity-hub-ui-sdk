import { useRef, useEffect, useState } from "react";
import BN from "bignumber.js";
import { useLiquidityHubPersistedStore } from "../../store/main";
import { LH_CONTROL } from "../../type";
import { Logger } from "../../util";

export const useQuoteDelay = (
  fromAmount: string,
  dexMinAmountOut?: string,
  quoteDelayMillis?: number
) => {
  const [enabled, setEnabled] = useState(false);
  const quoteTimeoutRef = useRef<any>(null);
  const lhControl = useLiquidityHubPersistedStore((s) => s.lhControl);

  useEffect(() => {
    clearTimeout(quoteTimeoutRef.current);
    if (enabled || BN(fromAmount).isZero()) return;
    if (!quoteDelayMillis || lhControl === LH_CONTROL.FORCE) {
      setEnabled(true);
      return;
    }

    if (BN(dexMinAmountOut || "0").gt(0)) {
      Logger("got price from dex, enabling quote ");
      setEnabled(true);
      clearTimeout(quoteTimeoutRef.current);
      return;
    }
    Logger("starting timeout to enable quote");
    quoteTimeoutRef.current = setTimeout(() => {
      setEnabled(true);
    }, quoteDelayMillis);
  }, [dexMinAmountOut, quoteDelayMillis, fromAmount, lhControl, enabled]);
};
