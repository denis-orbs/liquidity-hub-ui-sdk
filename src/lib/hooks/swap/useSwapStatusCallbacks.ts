import { useCallback } from "react";
import { swapAnalytics } from "../../analytics";
import { useMainContext } from "../../context/MainContext";
import { Quote, Token } from "../../type";
import { useAddOrderCallback } from "../useOrders";

export const useOnSwapSuccessCallback = () => {
  const updateState = useMainContext().updateState;
  const addOrder = useAddOrderCallback();

  return useCallback(
    ({
      quote,
      txHash,
      fromToken,
      toToken,
    }: {
      quote: Quote;
      txHash: string;
      fromToken: Token;
      toToken: Token;
    }) => {
      swapAnalytics.onClobOnChainSwapSuccess();
      updateState({
        sessionId: undefined,
      });
      addOrder({ quote, txHash, fromToken, toToken });
      swapAnalytics.clearState();
    },
    [updateState, addOrder]
  );
};
