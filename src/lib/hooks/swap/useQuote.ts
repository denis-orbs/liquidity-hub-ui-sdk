import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMainContext } from "../../provider";
import { QUERY_KEYS, QUOTE_REFETCH_THROTTLE } from "../../config/consts";
import { useApiUrl } from "./useApiUrl";
import BN from "bignumber.js";
import _ from "lodash";
import { useChainConfig } from "..";
import { quote } from "../../swap/quote";
import {
  ActionStatus,
  Token,
  UseLiquidityHubState,
  UseQueryData,
} from "../../type";
import { useWrapOrUnwrapOnly } from "../hooks";

export const useQuote = ({
  fromToken,
  toToken,
  fromAmount,
  dexMinAmountOut,
  swapStatus,
  showConfirmation,
  disabled,
  slippage,
  sessionId,
  updateState,
}: {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  dexMinAmountOut?: string;
  swapStatus?: ActionStatus;
  showConfirmation?: boolean;
  disabled?: boolean;
  slippage: number;
  updateState: (value: Partial<UseLiquidityHubState>) => void;
  sessionId?: string;
}) => {
  const context = useMainContext();
  const apiUrl = useApiUrl();
  const chainId = context.chainId;
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const pause = showConfirmation && context.quote?.pauseOnConfirmation;
  const fetchLimit = context.quote?.fetchLimit!;
  const {isUnwrapOnly, isWrapOnly} = useWrapOrUnwrapOnly(fromToken?.address, toToken?.address)

  const enabled =
    !!chainId &&
    !!wTokenAddress &&
    !!context.partner &&
    !!fromToken &&
    !!toToken &&
    BN(fromAmount || "0").gt(0) &&
    !!apiUrl &&
    !disabled &&
    swapStatus !== "loading" &&
    !pause &&
    !isUnwrapOnly &&
    !isWrapOnly;


  const queryKey = [
    QUERY_KEYS.QUOTE,
    fromToken?.address,
    toToken?.address,
    fromAmount,
    slippage,
    apiUrl,
    chainId,
  ];
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const quoteResponse = await quote({
        fromToken: fromToken!,
        toToken: toToken!,
        wTokenAddress: wTokenAddress!,
        fromAmount: fromAmount!,
        apiUrl: apiUrl!,
        dexMinAmountOut,
        account: context.account,
        partner: context.partner,
        sessionId,
        slippage,
        signal,
        quoteInterval: context.quote?.refetchInterval,
        chainId: chainId!,
      });

      if (quoteResponse.sessionId) {
        updateState({ sessionId: quoteResponse.sessionId });
      }

      const refetchCount = showConfirmation
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
      if (showConfirmation) {
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
