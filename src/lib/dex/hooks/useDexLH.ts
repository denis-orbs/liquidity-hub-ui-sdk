
import { useLiquidityHub } from "../..";
import { useDexState } from "../../store/dex";

export const useDexLH = () => {
  const store = useDexState();


  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: store.fromAmount,
    debounceFromAmountMillis: 300,
  });
};
