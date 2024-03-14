import { useLiquidityHub } from "../..";
import { useDexState } from "../../store/dex";
import { useDebouncedFromAmount } from "./useDebouncedFromAmount";


export const useDexLH = () => {
  const store = useDexState();

  const fromAmountUI =  useDebouncedFromAmount()

  
  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmountUI,
  });
};
