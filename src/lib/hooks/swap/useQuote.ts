import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, QUOTE_REFETCH_THROTTLE } from "../../config/consts";
import { useApiUrl } from "./useApiUrl";
import BN from "bignumber.js";
import _ from "lodash";
import { useChainConfig, useIsDisabled } from "..";
import { quote } from "../../swap/quote";
import { Token, UseQueryData } from "../../type";
import { useWrapOrUnwrapOnly } from "../hooks";
import { useMainContext } from "../../context/MainContext";
import { amountBN, safeBN } from "../../util";
import { useMemo } from "react";

interface Props {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  minAmountOut?: string;
  disabled?: boolean;
  slippage: number;
  pauseOnConfirmation?: boolean;
}

export const useQuote = (props: Props) => {
  const res = useQuoteQuery(props);

  return useMemo(() => {
    return {
      quote: res.data?.quote,
      isLoading: res.isLoading,
      error: res.error,
      isError: res.isError,
    };
  }, [res.data?.quote, res.isLoading, res.error, res.isError]);
};

export const useQuoteQuery = (props: Props) => {
  const context = useMainContext();

  const apiUrl = useApiUrl();
  const chainId = context.chainId;
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const pause = context.showConfirmation && props.pauseOnConfirmation;
  const fetchLimit = context.quote?.fetchLimit!;
  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    props.fromToken?.address,
    props.toToken?.address
  );

  const { fromAmount, dexMinAmountOut } = useMemo(() => {
    return {
      fromAmount: safeBN(amountBN(props.fromToken?.decimals,  props.fromAmount).toString()),
      dexMinAmountOut: safeBN(props.minAmountOut),
    };
  }, [props.fromAmount, props.minAmountOut, props.fromToken?.decimals]);

  const disabled = useIsDisabled();
  

  const enabled =
    !!chainId &&
    !!wTokenAddress &&
    !!context.partner &&
    !!props.fromToken &&
    !!props.toToken &&
    BN(fromAmount || "0").gt(0) &&
    !!apiUrl &&
    !props.disabled &&
    !disabled &&
    context.swapStatus !== "loading" &&
    !pause &&
    !isUnwrapOnly &&
    !isWrapOnly;

  
  const queryKey = [
    QUERY_KEYS.QUOTE,
    props.fromToken?.address,
    props.toToken?.address,
    fromAmount,
    props.slippage,
    apiUrl,
    chainId,
  ];
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {      
      context.actions.updateState({
        quoteQueryKey: queryKey,
        fromToken: props.fromToken,
        toToken: props.toToken,
        slippage: props.slippage,
        fromAmount,
        dexMinAmountOut,
      });
      const quoteResponse = await quote({
        fromToken: props.fromToken!,
        toToken: props.toToken!,
        wTokenAddress: wTokenAddress!,
        fromAmount: fromAmount!,
        apiUrl: apiUrl!,
        dexMinAmountOut,
        account: context.account,
        partner: context.partner,
        sessionId: context.sessionId,
        slippage: props.slippage,
        signal,
        quoteInterval: context.quote?.refetchInterval,
        chainId: chainId!,
      });

      if (quoteResponse.sessionId) {
        context.actions.updateState({ sessionId: quoteResponse.sessionId });
      }

      const refetchCount = context.showConfirmation
        ? 0
        : ((queryClient.getQueryData(queryKey) as UseQueryData)?.refetchCount ||
            0) + 1;

      return {
        quote: quoteResponse,
        refetchCount,
        isPassedLimit: refetchCount > fetchLimit,
        resetCount: () =>
          queryClient.setQueryData(queryKey, (data: UseQueryData) => {
            if (!data) return data;
            return {
              ...data,
              refetchCount: 0,
            };
          }),
      };
    },
    refetchInterval: ({ state: { data } }) => {
      if (data?.quote.disableRefetch) {
        return false;
      }
      if (context.showConfirmation) {
        return context.quote?.refetchInterval;
      }

      if (data?.refetchCount && data?.refetchCount > fetchLimit) {
        return QUOTE_REFETCH_THROTTLE;
      }
      return context.quote?.refetchInterval;
    },
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
