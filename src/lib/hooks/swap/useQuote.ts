import { useQuery } from "@tanstack/react-query";
import {
  EMPTY_QUOTE_RESPONSE,
  QUERY_KEYS,
  QUOTE_ERRORS,
  QUOTE_REFETCH_INTERVAL,
  QUOTE_TIMEOUT,
} from "../../config/consts";
import { useApiUrl } from "./useApiUrl";
import BN from "bignumber.js";
import _ from "lodash";
import { useChainConfig, useIsDisabled } from "..";
import { Quote, QuoteResponse, Token } from "../../type";
import { useWrapOrUnwrapOnly } from "../hooks";
import { useMainContext } from "../../context/MainContext";
import { counter, Logger, safeBN, shouldReturnZeroOutAmount } from "../../util";
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

const quote = async ({
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
  swapAnalytics.onQuoteRequest();
  let quote: Quote | undefined = undefined;
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
        inAmount: fromAmount,
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
    quote = await response.json();

    if (!quote) {
      throw new Error("No result");
    }

    if (quote.error) {
      throw new Error(quote.error);
    }

    if (!quote.outAmount || new BN(quote.outAmount).eq(0)) {
      throw new Error(QUOTE_ERRORS.noLiquidity);
    }
    swapAnalytics.onQuoteSuccess(count(), quote);

    Logger({
      fromAmount,
      fromAddress: fromToken?.address,
      toAddress: toToken?.address,
      dexMinAmountOut,
      quote,
      minAmountOut: quote.minAmountOut,
      gasAmountOut: quote.gasAmountOut,
      refetchInterval: quoteInterval,
    });
    quote = {
      ...quote,
      outAmount: safeBN(quote.outAmount) || "",
      minAmountOut: safeBN(quote.minAmountOut || 0) || "",
      gasAmountOut: safeBN(quote.gasAmountOut),
    };
    return {
      quote,
    };
  } catch (error: any) {
    swapAnalytics.onQuoteFailed(error.message, count(), quote);

    if (shouldReturnZeroOutAmount(error.message) || signal.aborted) {
      return EMPTY_QUOTE_RESPONSE;
    } else {
      throw new Error(error.message);
    }
  }
};

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
  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    props.fromToken?.address,
    props.toToken?.address
  );

  const { fromAmount, dexMinAmountOut } = useMemo(() => {
    return {
      fromAmount: safeBN(props.fromAmount),
      dexMinAmountOut: safeBN(props.minAmountOut),
    };
  }, [props.fromAmount, props.minAmountOut]);

  const disabled = useIsDisabled();
  const refetchInterval =
    context.quoteRefetchInterval || QUOTE_REFETCH_INTERVAL;

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

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject();
        }, QUOTE_TIMEOUT);
      });
      const quoteResponse = (await Promise.race([
        await quote({
          fromToken: props.fromToken!,
          toToken: props.toToken!,
          wTokenAddress: wTokenAddress!,
          fromAmount: fromAmount!,
          apiUrl: apiUrl!,
          dexMinAmountOut,
          account: context.account,
          partner: context.partner,
          sessionId: context.state.sessionId,
          slippage: props.slippage,
          signal,
          quoteInterval: refetchInterval,
          chainId: chainId!,
        }),
        timeoutPromise,
      ])) as QuoteResponse;
      context.updateState({ sessionId: quoteResponse.quote?.sessionId });
      clearTimeout(timeoutId);
      return quoteResponse;
    },
    refetchInterval: ({ state: { data } }) => {
      if (data?.disableRefetch) {
        return false;
      }
      return refetchInterval;
    },
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
