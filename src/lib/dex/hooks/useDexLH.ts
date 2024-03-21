import { useLiquidityHub } from "../..";
import { useDebounedFromAmount } from "../../hooks/useDebounedFromAmount";
import { useDexState } from "../../store/dex";
import { usePriceUsd } from "./usePriceUsd";

export const useDexLH = () => {
  const store = useDexState();
  const fromTokenUsd = usePriceUsd({ address: store.fromToken?.address }).data;
  const toTokenUsd = usePriceUsd({ address: store.toToken?.address }).data;

  const fromAmount = useDebounedFromAmount(store.fromAmount);

  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount,
    fromTokenUsd,
    toTokenUsd,
  });
};
