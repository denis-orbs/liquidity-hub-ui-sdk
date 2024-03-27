
import { useLiquidityHub } from "../..";
import { useDexState } from "../../store/dex";
import BN from "bignumber.js";
import { useEffect, useState } from "react";
export const useDexLH = () => {
  const store = useDexState();
  const [dexAmountOut, setDexAmountOut] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if(BN(store.fromAmount || 0).gt(0)) {
      setTimeout(() => {
        setDexAmountOut("0.06");
      }, 2_000);
    }
  }, [store.fromAmount]);

  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: store.fromAmount,
    debounceFromAmountMillis: 300,
    quoteDelayMillis: 10_000,
    expectedAmountOutUI: dexAmountOut

  });
};
