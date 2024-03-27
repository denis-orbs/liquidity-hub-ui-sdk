import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useFormatNumber } from "./useFormatNumber";
import { useQuote } from "./useQuote";
import { useTotalUsdValues } from "./useTotalUsdValues";
import { useOutAmount } from "./useOutAmount";

export const useSwapConfirmation = () => {
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showConfirmation: s.showConfirmation,
      fromAmount: s.fromAmount,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
    }))
  );

  const title = useMemo(() => {
    if (store.swapStatus === "failed") {
      return;
    }
    if (store.swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [store.swapStatus]);

  const toAmount = useOutAmount().ui;
  const fromAmountUI = useAmountUI(store.fromToken?.decimals, store.fromAmount);

  const { inAmountUsd, outAmountUsd } = useTotalUsdValues();
  const { data: quote } = useQuote();

  const minAmountOut = useFormatNumber({ value: quote?.ui.minAmountOut })

  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: fromAmountUI,
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    toAmount,
    isOpen: !!store.showConfirmation,
    onClose: store.onCloseSwap,
    inAmountUsd,
    outAmountUsd,
    title,
    minAmountOut,
  };
};
