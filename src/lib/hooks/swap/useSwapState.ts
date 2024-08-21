import { useCallback } from "react";
import { useSwapStore } from "../../store/main";
import { Quote, SwapStatus, SwapStep } from "../../type";

export const useSwapState = () => {
  const {
    updateState,
    swapStatus,
    swapStep,
    isWrappedNativeToken,
    txHash,
    acceptedQuote,
  } = useSwapStore();

  const onSwapStep = useCallback(
    (swapStep?: SwapStep) => {
      updateState({ swapStep });
    },
    [updateState]
  );

  const onSwapStatus = useCallback(
    (swapStatus?: SwapStatus) => {
      updateState({ swapStatus });
    },
    [updateState]
  );

  const onWrappedNativeToken = useCallback(() => {
    updateState({ isWrappedNativeToken: true });
  }, [updateState]);

  const onReset = useCallback(() => {
    updateState({
      swapStatus: undefined,
      swapStep: undefined,
      isWrappedNativeToken: false,
      acceptedQuote: undefined,
      txHash: undefined,
    });
  }, [updateState]);

  const onTxHash = useCallback(
    (txHash: string) => {
      updateState({ txHash });
    },
    [updateState]
  );

  const onAcceptedQuote = useCallback(
    (acceptedQuote?: Quote) => {
      updateState({ acceptedQuote });
    },
    [updateState]
  );

  return {
    onSwapStep,
    onSwapStatus,
    onReset,
    onWrappedNativeToken,
    onTxHash,
    onAcceptedQuote,
    swapStatus,
    swapStep,
    isWrappedNativeToken,
    txHash,
    acceptedQuote,
  };
};
