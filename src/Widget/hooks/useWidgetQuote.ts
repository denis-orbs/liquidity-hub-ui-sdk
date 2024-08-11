import { useAmountBN, useQuote } from "../../lib";
import { useWidgetContext } from "../context";

export const useWidgetQuote = () => {
  const {
    state: { fromToken, toToken, fromAmountUi },
    slippage,
  } = useWidgetContext();


  return useQuote({
    fromToken,
    toToken,
    fromAmount: useAmountBN(fromToken?.decimals, fromAmountUi),
    slippage: slippage || 0.5,
  });
};
