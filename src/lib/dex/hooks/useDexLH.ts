import { useLiquidityHub } from "../..";
import { useDebounce } from "../../hooks/useDebounce";
import { useDexState } from "../../store/dex";


export const useDexLH = () => {
  const store = useDexState();

  const fromAmountUI = useDebounce(store.fromAmount, 300);

  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmountUI,
  });
};
