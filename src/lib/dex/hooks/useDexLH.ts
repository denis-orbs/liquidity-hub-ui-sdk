import { useLiquidityHub } from "../..";
import { useDebounedFromAmount } from "../../hooks/useDebounedFromAmount";
import { useDexState } from "../../store/dex";

export const useDexLH = () => {
  const store = useDexState();

  const fromAmount = useDebounedFromAmount(store.fromAmount);

  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount,
  });
};
