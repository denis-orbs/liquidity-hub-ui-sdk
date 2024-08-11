
import { useCallback } from "react";
import BN from "bignumber.js";
import { useTokenListBalance } from "../hooks/useTokenListBalance";
import { useWidgetContext } from "../context";
import { useAmountUI } from "../../lib";


export const usePercentSelect = () => {
  const { updateState, state:{fromToken} } = useWidgetContext()

  const {balance: fromTokenBalance} = useTokenListBalance(fromToken?.address);
    const balanceUi = useAmountUI(fromToken?.decimals, fromTokenBalance)
  return useCallback(
    (percent: number) => {
      updateState({
        fromAmount: new BN(balanceUi || "0")
          .multipliedBy(percent)
          .toString(),
      });
    },
    [updateState, balanceUi]
  );
};
