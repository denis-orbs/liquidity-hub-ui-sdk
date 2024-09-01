import { Quote, Token } from "../type";
import { counter, getApiUrl, Logger, promiseWithTimeout } from "../util";
import { swapAnalytics } from "../analytics";
import { QUOTE_TIMEOUT } from "../config/consts";

export const fetchQuote = async ({
  fromToken,
  toToken,
  inAmount,
  minAmountOut,
  account,
  partner,
  slippage,
  signal,
  chainId,
  sessionId,
  timeout = QUOTE_TIMEOUT
}: {
  fromToken: Token;
  toToken: Token;
  inAmount: string;
  minAmountOut?: string;
  account?: string;
  partner: string;
  slippage: number;
  signal?: AbortSignal;
  chainId: number;
  sessionId?: string;
  timeout?: number;
}) => {

  const apiUrl = getApiUrl(chainId);
  const analyticsArgs = {
    fromToken,
    toToken,
    fromAmount: inAmount,
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
          inToken: fromToken?.address,
          outToken: toToken?.address,
          inAmount,
          outAmount: !minAmountOut ? "-1" : minAmountOut,
          user: account,
          slippage,
          qs: encodeURIComponent(
            window.location.hash || window.location.search
          ),
          partner: partner.toLowerCase(),
          sessionId,
        }),
        signal,
      }),
      timeout
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
