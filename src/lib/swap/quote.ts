import { QueryKey } from "@tanstack/react-query";
import BN from "bignumber.js";
import _ from "lodash";
import { swapAnalytics } from "../analytics";
import {
  EMPTY_QUOTE_RESPONSE,
  QUOTE_ERRORS,
  zeroAddress,
} from "../config/consts";
import { OriginalQuote, QuoteResponse, Token } from "../type";
import {
  counter,
  amountUi,
  isNativeAddress,
  shouldReturnZeroOutAmount,
  eqIgnoreCase,
  Logger,
  safeBN,
} from "../util";

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
  queryClient: any;
  queryKey: QueryKey;
  chainId: number;
}

export const quote = async ({
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
  queryClient,
  queryKey,
  chainId,
}: Args) => {
  swapAnalytics.onQuoteRequest();
  let quote: OriginalQuote | undefined = undefined;
  const count = counter();

  const isUnwrap =
    eqIgnoreCase(wTokenAddress || "", fromToken?.address || "") &&
    isNativeAddress(toToken?.address || "");

  const isWrap =
    eqIgnoreCase(wTokenAddress || "", toToken?.address || "") &&
    isNativeAddress(fromToken?.address || "");

  if (isUnwrap || isWrap) {
    const amount = amountUi(fromToken?.decimals, new BN(fromAmount || "0"));
    return {
      ...EMPTY_QUOTE_RESPONSE,
      outAmount: fromAmount!,
      ui: {
        minAmountOut: amount,
        outAmount: amount,
      },
    };
  }

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

    const ui = {
      outAmount: amountUi(toToken?.decimals, new BN(quote.outAmount)),
      minAmountOut: amountUi(toToken?.decimals, BN(quote.minAmountOut || 0)),
      gasAmountOut: amountUi(toToken?.decimals, BN(quote.gasAmountOut || 0)),
    };

    Logger({
      fromAmount,
      fromAddress: fromToken?.address,
      toAddress: toToken?.address,
      dexMinAmountOut,
      quote,
      minAmountOut: quote.minAmountOut,
      gasAmountOut: quote.gasAmountOut,
      ui,
      refetchInterval: quoteInterval,
    });
    const res: QuoteResponse = {
        originalQuote: quote,
      ...quote,
      outAmount: safeBN(quote.outAmount) || "",
      minAmountOut: safeBN(quote.minAmountOut || 0) || "",
      gasAmountOut: safeBN(quote.gasAmountOut),
      ui,
    };
    res.refetchCount =
      ((queryClient.getQueryData(queryKey) as QuoteResponse)?.refetchCount ||
        0) + 1;

    return res;
  } catch (error: any) {
    swapAnalytics.onQuoteFailed(error.message, count(), quote);

    if (shouldReturnZeroOutAmount(error.message) || signal.aborted) {
      return EMPTY_QUOTE_RESPONSE;
    } else {
      throw new Error(error.message);
    }
  }
};
