import { useQuery } from "@tanstack/react-query";
import {
  QUERY_KEYS,
  QUOTE_REFETCH_INTERVAL,
  QUOTE_TIMEOUT,
} from "../../config/consts";
import BN from "bignumber.js";
import _ from "lodash";
import { Quote, Token } from "../../type";
import { useWrapOrUnwrapOnly } from "../hooks";
import { useMainContext } from "../../context/MainContext";
import { counter, getChainConfig, Logger, safeBN } from "../../util";
import { useMemo } from "react";
import { isNativeAddress } from "@defi.org/web3-candies";
import { zeroAddress } from "viem";
import { swapAnalytics } from "../../analytics";

interface Args {
  fromToken: Token;
  toToken: Token;
  wTokenAddress: string;
  fromAmount: string;
  apiUrl: string;
  dexMinAmountOut?: string;
  account?: string;
  partner: string;
  sessionId?: string;
  slippage: number;
  signal: AbortSignal;
  quoteInterval?: number;
  chainId: number;
}

const fetchQuote = async ({
  fromToken,
  toToken,
  wTokenAddress,
  fromAmount,
  apiUrl,
  dexMinAmountOut,
  account,
  partner,
  sessionId,
  slippage,
  signal,
  quoteInterval,
  chainId,
}: Args) => {
  const analyticsArgs = {
    fromToken,
    toToken,
    wTokenAddress,
    fromAmount,
    apiUrl,
    dexMinAmountOut,
    account,
    partner,
    sessionId,
    slippage,
    signal,
    quoteInterval,
    chainId,
  };

  swapAnalytics.onQuoteRequest(analyticsArgs);
  const count = counter();

  try {
    const response = await fetch(`${apiUrl}/quote?chainId=${chainId}`, {
      method: "POST",
      body: JSON.stringify({
        inToken: isNativeAddress(fromToken?.address || "")
          ? wTokenAddress
          : fromToken?.address,
        outToken: isNativeAddress(toToken?.address || "")
          ? zeroAddress
          : toToken?.address,
        inAmount: safeBN(fromAmount),
        outAmount: _.isUndefined(dexMinAmountOut) ? "-1" : dexMinAmountOut,
        user: account || zeroAddress,
        slippage,
        qs: encodeURIComponent(window.location.hash || window.location.search),
        partner: partner.toLowerCase(),
        sessionId,
      }),
      signal,
    });
    Logger("calling quote api");
    const quote = await response.json();

    if (!quote) {
      throw new Error("No result");
    }

    if (quote.error) {
      throw new Error(quote.error);
    }
    swapAnalytics.onQuoteSuccess(count(), quote, analyticsArgs);

    return quote;
  } catch (error: any) {
    swapAnalytics.onQuoteFailed(error.message, count());
    throw new Error(error.message);
  }
};

export interface Props {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  minAmountOut?: string;
  disabled?: boolean;
  slippage: number;
  chainId?: number;
  refetchInterval?: number;
  account?: string;
}

export const useQuote = (props: Props) => {
  const res = useQuoteQuery(props);
  return useMemo(() => {
    return {
      quote: res.data,
      isLoading: res.isLoading,
      error: res.error,
      isError: res.isError,
    };
  }, [res.data, res.isLoading, res.error, res.isError]);
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
}: Props) => {
  const context = useMainContext();
  const chainConfig = useMemo(() => {
    return getChainConfig(chainId);
  }, [chainId]);

  const wTokenAddress = chainConfig?.wToken?.address;
  const apiUrl = chainConfig?.apiUrl;

  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    fromToken?.address,
    toToken?.address
  );

  const enabled =
    !!chainId &&
    !!wTokenAddress &&
    !!context.partner &&
    !!fromToken &&
    !!toToken &&
    BN(fromAmount || "0").gt(0) &&
    !!apiUrl &&
    !disabled &&
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

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject();
        }, QUOTE_TIMEOUT);
      });
      const quote = (await Promise.race([
        await fetchQuote({
          fromToken: fromToken!,
          toToken: toToken!,
          wTokenAddress: wTokenAddress!,
          fromAmount: fromAmount!,
          apiUrl: apiUrl!,
          dexMinAmountOut,
          account: account,
          partner: context.partner,
          sessionId: context.state.sessionId,
          slippage,
          signal,
          quoteInterval: refetchInterval,
          chainId: chainId!,
        }),
        timeoutPromise,
      ])) as Quote;
      context.updateState({ sessionId: quote?.sessionId });
      clearTimeout(timeoutId);
      return quote;
    },
    refetchInterval,
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
