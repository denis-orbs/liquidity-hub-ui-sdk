import { useSwapState } from "../store/main";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAllowance } from "./useAllowance";
import { useSubmitSwap } from "./useSubmitSwap";
import { isNativeAddress } from "../util";

export const useSwapButton = () => {
  const { fromToken, swapStatus, fromAmount } = useSwapState(
    useShallow(
      useShallow((s) => ({
        fromToken: s.fromToken,
        swapStatus: s.swapStatus,
        fromAmount: s.fromAmount,
      }))
    )
  );

  const { data: approved, isLoading: allowanceLoading } = useAllowance(
    fromToken,
    fromAmount
  );

  const swap = useSubmitSwap();

  return useMemo(() => {
    const getText = () => {
      if (isNativeAddress(fromToken?.address || "")) return "Wrap and swap";
      if (!approved) return "Approve and swap";
      return "Sign and Swap";
    };

    return {
      text: getText(),
      swap,
      isPending: swapStatus === "loading" || allowanceLoading,
    };
  }, [
    approved,
    fromToken,
    swapStatus,
    swap,
    allowanceLoading,
  ]);
};
