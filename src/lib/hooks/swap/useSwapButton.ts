import { useSwapState } from "../../store/main";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAllowance } from "./useAllowance";
import { useSubmitSwap } from "./useSubmitSwap";
import { isNativeAddress } from "../../util";

export const useSwapButton = (onWrapSuccess?: () => void) => {
  const { fromToken, swapStatus } = useSwapState(
    useShallow(
      useShallow((s) => ({
        fromToken: s.fromToken,
        swapStatus: s.swapStatus,
      }))
    )
  );

  const { data: approved, isLoading: allowanceLoading } = useAllowance();

  const swap = useSubmitSwap(onWrapSuccess);

  return useMemo(() => {
    const getText = () => {
      if (isNativeAddress(fromToken?.address || "")) return "Wrap and Swap";
      if (!approved) return "Approve and Swap";
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
