import { useLiquidityHub } from "../..";
import { useDexState } from "../../store/dex";
import { usePriceUsd } from "./usePriceUsd";

export const useDexLH = () => {
  const store = useDexState();
  const fromTokenUsd = usePriceUsd({ address: store.fromToken?.address }).data;
  const toTokenUsd = usePriceUsd({ address: store.toToken?.address }).data;

  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmountUI: store.fromAmount,
    fromTokenUsd,
    toTokenUsd,
  });
};
