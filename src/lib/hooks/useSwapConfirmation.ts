import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useQuotePayload } from "./useQuoteData";
import { useSwapButton } from "./useSwapButton";

export const useSwapConfirmation = () => {
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showConfirmation: s.showConfirmation,
      updateState: s.updateState,
      fromAmount: s.fromAmount,
      dexExpectedAmountOut: s.dexExpectedAmountOut,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd,
    }))
  );

  const quote = useQuotePayload().data;

  const toAmount = useMemo(() => {
    if (store.dexExpectedAmountOut) {
      return store.dexExpectedAmountOut;
    }
    return quote?.outAmount;
  }, [quote?.outAmount, store.dexExpectedAmountOut]);

  const title = useMemo(() => {
    if (store.swapStatus === "failed") {
      return 
    }
    if (store.swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [store.swapStatus]);

  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: useAmountUI(store.fromToken?.decimals, store.fromAmount),
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    toAmount: useAmountUI(store.toToken?.decimals, toAmount),
    showModal: !!store.showConfirmation,
    closeModal: store.onCloseSwap,
    fromTokenUsd: store.fromTokenUsd,
    toTokenUsd: store.toTokenUsd,
    ...useSwapButton(),
    title,
  };
};
