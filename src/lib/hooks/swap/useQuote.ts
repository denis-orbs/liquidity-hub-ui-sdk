import {
  QUERY_KEYS,
  QUOTE_TIMEOUT,
  QUOTE_REFETCH_INTERVAL,
} from "../../config/consts";
import _ from "lodash";
import { Quote, Token } from "../../type";
import {
  counter,
  getChainConfig,
  Logger,
  promiseWithTimeout,
  safeBN,
} from "../../util";
import { isNativeAddress } from "@defi.org/web3-candies";
import { zeroAddress } from "viem";
import { swapAnalytics } from "../../analytics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useWrapOrUnwrapOnly } from "../hooks";

export const fetchQuote = async ({
  fromToken,
  toToken,
  fromAmount,
  minAmountOut,
  account,
  partner,
  slippage,
  signal,
  chainId,
  sessionId
}: {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  minAmountOut?: string;
  account?: string;
  partner: string;
  slippage: number;
  signal?: AbortSignal;
  chainId: number;
  sessionId?: string;
}) => {
  const chainConfig = getChainConfig(chainId);

  if (!chainConfig) {
    throw new Error("Chain config not found");
  }
  const { wToken, apiUrl } = chainConfig;

  const analyticsArgs = {
    fromToken,
    toToken,
    wTokenAddress: wToken.address,
    fromAmount,
    apiUrl,
    dexMinAmountOut: minAmountOut,
    account,
    partner,
    sessionId,
    slippage,
    chainId,
  };

  swapAnalytics.onQuoteRequest(analyticsArgs);
  const count = counter();

  try {
    const response = await promiseWithTimeout(
      fetch(`${apiUrl}/quote?chainId=${chainId}`, {
        method: "POST",
        body: JSON.stringify({
          inToken: isNativeAddress(fromToken?.address || "")
            ? wToken.address
            : fromToken?.address,
          outToken: isNativeAddress(toToken?.address || "")
            ? zeroAddress
            : toToken?.address,
          inAmount: safeBN(fromAmount),
          outAmount: _.isUndefined(minAmountOut) ? "-1" : minAmountOut,
          user: account || zeroAddress,
          slippage,
          qs: encodeURIComponent(
            window.location.hash || window.location.search
          ),
          partner: partner.toLowerCase(),
          sessionId,
        }),
        signal,
      }),
      QUOTE_TIMEOUT
    );
    Logger("calling quote api");
    const quote = await response.json();

    if (!quote) {
      throw new Error("No result");
    }

    if (quote.error) {
      throw new Error(quote.error);
    }
    swapAnalytics.onQuoteSuccess(count(), quote, analyticsArgs);
    return quote as Quote;
  } catch (error: any) {
    swapAnalytics.onQuoteFailed(error.message, count());
    throw new Error(error.message);
  }
};

export const useQuoteQuery = ({
  chainId,
  fromToken,
  toToken,
  fromAmount,
  disabled,
  slippage,
  minAmountOut: dexMinAmountOut,
  refetchInterval = QUOTE_REFETCH_INTERVAL,
  account,
  partner,
}: {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  minAmountOut?: string;
  disabled?: boolean;
  slippage: number;
  chainId?: number;
  refetchInterval?: number;
  account?: string;
  partner: string;
}) => {
  const queryClient = useQueryClient()
  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    fromToken?.address,
    toToken?.address
  );

  const enabled =
    !!chainId &&
    !!fromToken &&
    !!toToken &&
    BN(fromAmount || "0").gt(0) &&
    !!partner &&
    !disabled &&
    !isUnwrapOnly &&
    !isWrapOnly;

  const queryKey = [
    QUERY_KEYS.QUOTE,
    fromToken?.address,
    toToken?.address,
    fromAmount,
    slippage,
    partner,
    chainId,
  ];

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const sessionId = (queryClient.getQueryData(queryKey) as Quote | undefined)?.sessionId;
      
      const quote = await fetchQuote({
        fromToken: fromToken!,
        toToken: toToken!,
        fromAmount: fromAmount!,
        minAmountOut: dexMinAmountOut,
        account: account,
        partner,
        slippage,
        signal,
        chainId: chainId!,
        sessionId
      });
      return quote;
    },
    refetchInterval,
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
