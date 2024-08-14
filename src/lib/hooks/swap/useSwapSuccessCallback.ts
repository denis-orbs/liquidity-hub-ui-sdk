import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { swapAnalytics } from "../../analytics";
import { QUERY_KEYS } from "../../config/consts";
import { useMainContext } from "../../context/MainContext";
import { Quote, Token } from "../../type";
import { useAddOrderCallback } from "../useOrders";

export const useSwapSuccessCallback = () => {
  const updateState = useMainContext().updateState;
  const addOrder = useAddOrderCallback();
  const queryClient = useQueryClient();

  return useCallback(
    (
      quote: Quote,
      txHash: string,
      fromToken: Token,
      toToken: Token,
      chainId: number
    ) => {
      swapAnalytics.onClobOnChainSwapSuccess();
      updateState({
        sessionId: undefined,
      });
      addOrder({ quote, txHash, fromToken, toToken, chainId });
      swapAnalytics.clearState();
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.QUOTE],
        exact: false,
      });
    },
    [updateState, addOrder]
  );
};
