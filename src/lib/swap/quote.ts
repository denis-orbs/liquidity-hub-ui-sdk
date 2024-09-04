import { Quote, QuoteArgs } from "../type";
import { counter, getApiUrl, Logger, promiseWithTimeout } from "../util";
import { swapAnalytics } from "../analytics";
import { QUOTE_TIMEOUT } from "../consts";

export const fetchQuote = async (args: QuoteArgs) => {
  const apiUrl = getApiUrl(args.chainId);
  console.log({args});
  
  swapAnalytics.onQuoteRequest(args);
  const count = counter();

  try {
    const response = await promiseWithTimeout(
      fetch(`${apiUrl}/quote?chainId=${args.chainId}`, {
        method: "POST",
        body: JSON.stringify({
          inToken: args.fromToken,
          outToken: args.toToken,
          inAmount: args.inAmount,
          outAmount: !args.minAmountOut ? "-1" : args.minAmountOut,
          user: args.account,
          slippage: args.slippage,
          qs: encodeURIComponent(
            window.location.hash || window.location.search
          ),
          partner: args.partner.toLowerCase(),
          sessionId: args.sessionId,
        }),
        signal: args.signal,
      }),
      args.timeout || QUOTE_TIMEOUT
    );
    Logger("calling quote api");
    const quote = await response.json();

    if (!quote) {
      throw new Error("No result");
    }

    if (quote.error) {
      throw new Error(quote.error);
    }
    swapAnalytics.onQuoteSuccess(count(), quote);
    return quote as Quote;
  } catch (error: any) {
    swapAnalytics.onQuoteFailed(error.message, count());
    throw new Error(error.message);
  }
};
