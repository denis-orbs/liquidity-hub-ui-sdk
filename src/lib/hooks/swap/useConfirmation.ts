import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useMainContext } from "../../context/MainContext";
import { useGetQuoteQuery } from "./useGetQuoteQuery";

export function useConfirmation(isOpen: boolean) {
  const { updateState, state } = useMainContext();

  const { isWrapped, quoteQueryKey, swapStatus } = state;
  const isOpenRef = useRef(false);
  const getQuoteQuery = useGetQuoteQuery();
  const queryClient = useQueryClient();
  const onCloseConfirmation = useCallback(() => {
    updateState({
      showConfirmation: false,
    });
    if (!swapStatus) return;
    if (swapStatus === "loading") return;

    // refetch quote to get new session id
    queryClient.resetQueries({ queryKey: quoteQueryKey });
  }, [swapStatus, updateState, queryClient]);

  const onShowConfirmation = useCallback(() => {
    const quoteQuery = getQuoteQuery();

    updateState({
      showConfirmation: true,
    });
    quoteQuery?.data?.resetCount();

    queryClient?.refetchQueries({ queryKey: quoteQueryKey });
  }, [updateState, getQuoteQuery, queryClient, quoteQueryKey]);

  useEffect(() => {
    if (isOpenRef.current === isOpen) return;
    if (isOpen) {
      onShowConfirmation();
      isOpenRef.current = true;
    } else if (isOpenRef.current) {
      onCloseConfirmation();
    }

    isOpenRef.current = isOpen;
  }, [isOpen, onShowConfirmation, onCloseConfirmation]);

  return {
    onCloseConfirmation,
    onShowConfirmation,
    swapStatus,
    isWrapped,
    isFailed: swapStatus === "failed",
    isSuccess: swapStatus === "success",
  };
}
