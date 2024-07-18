import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useMainContext } from "../../context/MainContext";
import { useQuoteQuery } from "./useQuote";

export function useGetQuoteQuery() {
  const quoteQueryKey = useMainContext().quoteQueryKey;
  const queryClient = useQueryClient();
  return useCallback(() => {
    if (!quoteQueryKey) return;
    return queryClient.getQueryData<ReturnType<typeof useQuoteQuery>>(quoteQueryKey);
  }, [queryClient, quoteQueryKey]);
}
