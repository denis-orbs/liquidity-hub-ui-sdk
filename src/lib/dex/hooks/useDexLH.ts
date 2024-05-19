
import { useAmountBN, useLiquidityHub } from "../..";
import { useDexState } from "../../store/dex";
import { usePriceUsd } from "./usePriceUsd";

export const useDexLH = () => {
  const store = useDexState();

  const fromAmount = useAmountBN(store.fromToken?.decimals, store.fromAmount)
  const inTokenUsd = usePriceUsd({address: store.fromToken?.address}).data
  const outTokenUsd = usePriceUsd({address: store.toToken?.address}).data
  
  
  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount,
    debounceFromAmountMillis: 300,
    slippage: 0.5,
    inTokenUsd,
    outTokenUsd,
  });
};
