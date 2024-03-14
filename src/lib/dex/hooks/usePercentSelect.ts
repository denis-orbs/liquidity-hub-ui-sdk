
import { useCallback } from "react";
import BN from "bignumber.js";
import { useTokenListBalance } from "../hooks/useTokenListBalance";
import { useShallow } from "zustand/react/shallow";
import { useDexState } from "../../store/dex";


export const usePercentSelect = () => {
  const { updateState, fromToken } = useDexState(
    useShallow((s) => ({
      updateState: s.updateStore,
      fromToken: s.fromToken,
    }))
  );

  const {balance: fromTokenBalance} = useTokenListBalance(fromToken?.address);

  return useCallback(
    (percent: number) => {
      updateState({
        fromAmount: new BN(fromTokenBalance || "0")
          .multipliedBy(percent)
          .toString(),
      });
    },
    [updateState, fromTokenBalance]
  );
};
