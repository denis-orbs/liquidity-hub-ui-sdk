import { swapAnalytics } from "../analytics";
import { Quote } from "../type";
import { counter } from "../util";

interface Args {
  signature: string;
  inTokenAddress: string;
  outTokenAddress: string;
  fromAmount: string;
  quote?: Quote;
  account: string;
  chainId: number;
  apiUrl: string;
}

export const swapX = async (args: Args) => {
  const { account, chainId, apiUrl } = args;

  const count = counter();
  swapAnalytics.onSwapRequest();
  try {
    if (!args.quote) {
      throw new Error("Missing quote");
    }
    const response = await fetch(`${apiUrl}/swapx?chainId=${chainId}`, {
      method: "POST",
      body: JSON.stringify({
        ...args.quote,
        inToken: args.inTokenAddress,
        outToken: args.outTokenAddress,
        inAmount: args.fromAmount,
        user: account,
        signature: args.signature,
      }),
    });
    const swap = await response.json();
    if (!swap) {
      throw new Error("Missing swap response");
    }
    if (swap.error) {
      throw new Error(swap.error);
    }
    if (!swap.txHash) {
      throw new Error("Missing txHash");
    }

    swapAnalytics.onSwapSuccess(swap.txHash, count());
    return swap.txHash;
  } catch (error: any) {
    const msg = error.message.error || error.message;
    swapAnalytics.onSwapFailed(msg, count());
    throw new Error("Something went wrong");
  }
};
