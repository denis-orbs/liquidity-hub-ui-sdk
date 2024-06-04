
import { useAmountBN, useLiquidityHub } from "../..";
import { useDexState } from "../../store/dex";

export const useDexLH = () => {
  const store = useDexState();

  const fromAmount = useAmountBN(store.fromToken?.decimals, store.fromAmount)  
  
  return   useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount,
    debounceFromAmountMillis: 300,
  });  

};
