import { useAmountBN, useQuoteQuery } from "../../lib";
import { useWidgetContext } from "../context";

export const useWidgetQuote = () => {
  const {
    state: { fromToken, toToken, fromAmountUi },
    slippage,
    account, chainId
  } = useWidgetContext();


  return useQuoteQuery({
    fromToken,
    toToken,
    fromAmount: useAmountBN(fromToken?.decimals, fromAmountUi),
    slippage: slippage || 0.5,
    account,
    chainId,
    partner:'widget'
  });
};
