import { useLiquidityHub, usePriceUsd } from "../..";
import { useDexState } from "../../store/dex";
import { useDebouncedFromAmount } from "./useDebouncedFromAmount";


export const useDexLH = () => {
  const store = useDexState();
  const fromTokenUsd = usePriceUsd({address: store.fromToken?.address}).data;
  const toTokenUsd = usePriceUsd({address: store.toToken?.address}).data;

  const fromAmountUI =  useDebouncedFromAmount()

  
  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmountUI,
    fromTokenUsd,
    toTokenUsd,
  });
};
