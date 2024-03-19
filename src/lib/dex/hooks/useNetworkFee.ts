import { useFormatNumber } from "../../hooks";
import { useDexState } from "../../store/dex";
import { useDexLH } from "./useDexLH";
import { useUsdAmount } from "./useUsdAmount";

export function useNetworkFee(decimalScale?: number) {
  const { quote, quoteLoading } = useDexLH();
  const toToken = useDexState((s) => s.toToken);
  const usdPrice = useUsdAmount(
    toToken?.address,
    quote?.gasCostOutputToken || "0"
  );

  const value = useFormatNumber({
    value: usdPrice.usd,
    decimalScale,
  });

  return {
    value,
    isLoading: quoteLoading || quote?.gasCostOutputToken && !usdPrice.usd,
  };
}
