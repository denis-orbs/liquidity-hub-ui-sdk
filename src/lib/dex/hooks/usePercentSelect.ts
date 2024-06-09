
import { useCallback } from "react";
import BN from "bignumber.js";
import { useTokenListBalance } from "../hooks/useTokenListBalance";
import { useShallow } from "zustand/react/shallow";
import { useDexState } from "../../store/dex";
import { useAmountUI } from "../../hooks";


export const usePercentSelect = () => {
  const { updateState, fromToken } = useDexState(
    useShallow((s) => ({
      updateState: s.updateStore,
      fromToken: s.fromToken,
    }))
  );

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
