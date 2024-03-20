import { useFormatNumber } from "../../hooks";
import { useDexState } from "../../store/dex";
import { useDexLH } from "./useDexLH";
import { useUsdAmount } from "./useUsdAmount";

export function useNetworkFee(decimalScale?: number) {
  const { quote } = useDexLH();
  const toToken = useDexState((s) => s.toToken);
  const usdPrice = useUsdAmount(
    toToken?.address,
    quote?.data?.gasCostOutputToken || "0"
  );

  const value = useFormatNumber({
    value: usdPrice.usd,
    decimalScale,
  });

  return {
    value,
    isLoading: quote.isLoading || quote?.data?.gasCostOutputToken && !usdPrice.usd,
  };
}
