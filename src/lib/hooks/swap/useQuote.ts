import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMainContext } from "../../provider";
import { useGlobalStore } from "../../store/main";
import { QUERY_KEYS } from "../../config/consts";
import { useApiUrl } from "./useApiUrl";
import BN from "bignumber.js";
import _ from "lodash";
import { useChainConfig } from "..";
import { quote } from "../../swap/quote";
import { ActionStatus, Token } from "../../type";

export const useQuote = ({
  fromToken,
  toToken,
  fromAmount,
  dexMinAmountOut,
  swapStatus,
  showConfirmation,
  disabled,
  slippage
}: {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  dexMinAmountOut?: string;
  swapStatus?: ActionStatus;
  showConfirmation?: boolean;
  disabled?: boolean;
  slippage: number;
}) => {
  const context = useMainContext();
  const apiUrl = useApiUrl();
  const { sessionId, setSessionId } = useGlobalStore();

  const chainId = context.chainId || _.first(context.supportedChains);
  const wTokenAddress = useChainConfig()?.wToken?.address;

  const enabled =
    !!chainId &&
    !!wTokenAddress &&
    !!context.partner &&
    !!chainId &&
    !!fromToken &&
    !!toToken &&
    BN(fromAmount || "0").gt(0) &&
    !!apiUrl &&
    !disabled &&
    !swapStatus;

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
        queryClient,
        queryKey,
        chainId: chainId!,
      });

      if (quoteResponse.sessionId) {
        setSessionId(quoteResponse.sessionId);
      }

      return quoteResponse;
    },
    refetchInterval: ({ state }) => {
      const quoteInterval = context.quote?.refetchInterval || 15_000;
      const refetchUntilThrottle = context.quote?.refetchUntilThrottle || 10;

      if (showConfirmation) {
        return quoteInterval;
      }
      if (state.data?.disableInterval || swapStatus) {
        return undefined;
      }
      const refetchCount = state.data?.refetchCount || 0;
      if (refetchCount > refetchUntilThrottle) {
        return (refetchCount * quoteInterval) / 2;
      }
      return quoteInterval;
    },
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
