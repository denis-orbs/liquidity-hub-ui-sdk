import { QueryKey } from "@tanstack/react-query";
import BN from "bignumber.js";
import _ from "lodash";
import { swapAnalytics } from "../analytics";
import { EMPTY_QUOTE_RESPONSE, QUOTE_ERRORS, zeroAddress } from "../config/consts";
import { QuoteResponse, Token } from "../type";
import {
  counter,
  amountUi,
  isNativeAddress,
  shouldReturnZeroOutAmount,
  eqIgnoreCase,
  Logger,
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
  chainId
}: Args) => {
  swapAnalytics.onQuoteRequest();
  let quote;
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

    const outAmountUI = amountUi(toToken?.decimals, new BN(quote.outAmount));

    const minAmountOut = parseInt(
      quote?.permitData.values.witness.outputs[1].endAmount.hex,
      16
    );

    const gasCostOutputToken = parseInt(
      quote?.permitData.values.witness.outputs[0].startAmount.hex,
      16
    );

    const ui = {
      outAmount: outAmountUI,
      minAmountOut: amountUi(toToken?.decimals, BN(minAmountOut || 0)),
      gasCostOutputToken: amountUi(toToken?.decimals, BN(gasCostOutputToken)),
    };

    Logger({
      fromAmount,
      fromAddress: fromToken?.address,
      toAddress: toToken?.address,
      dexMinAmountOut,
      quote,
      minAmountOut,
      gasCostOutputToken,
      ui,
      refetchInterval:quoteInterval,
    });
    const res = {
      ...quote,
      minAmountOut,
      gasCostOutputToken,
      ui,
    } as QuoteResponse;
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
