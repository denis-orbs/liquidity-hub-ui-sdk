import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { swapAnalytics } from "../../analytics";
import { Quote, Token } from "../../type";
import { counter, delay, getChainConfig } from "../../util";

interface Args {
  signature: string;
  inTokenAddress: string;
  outTokenAddress: string;
  fromAmount: string;
  quote?: Quote;
  account: string;
  chainId: number;
  apiUrl: string;
  dexTx?: any;
}

export const swapX = async (args: Args) => {
  const { account, chainId, apiUrl } = args;

  const count = counter();
  swapAnalytics.onSwapRequest();
  try {
    if (!args.quote) {
      throw new Error("Missing quote");
    }
    const response = await fetch(`${apiUrl}/swap-async?chainId=${chainId}`, {
      method: "POST",
      body: JSON.stringify({
        ...args.quote,
        inToken: args.inTokenAddress,
        outToken: args.outTokenAddress,
        inAmount: args.fromAmount,
        user: account,
        signature: args.signature,
        dexTx: args.dexTx,
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

export const swapCallback = async (
  fromToken: Token,
  toToken: Token,
  quote: Quote,
  signature: string,
  account: string,
  chainId: number,
  dexTx?: any
) => {
  const chainConfig = getChainConfig(chainId);

  const wTokenAddress = chainConfig?.wToken?.address;
  const apiUrl = chainConfig?.apiUrl;

  let inTokenAddress = isNativeAddress(fromToken.address || "")
    ? wTokenAddress
    : fromToken?.address;
  const outTokenAddress = isNativeAddress(toToken.address || "")
    ? zeroAddress
    : toToken?.address;

  if (!inTokenAddress || !outTokenAddress || !account || !chainId || !apiUrl) {
    throw new Error("Invalid state");
  }
  const count = counter();
  swapX({
    signature,
    inTokenAddress,
    outTokenAddress,
    fromAmount: quote.inAmount,
    quote,
    account,
    chainId,
    apiUrl,
    dexTx
  })
    .then()
    .catch(() => {});
  try {
    const txHash = await waitForSwap({
      sessionId: quote.sessionId,
      apiUrl: chainConfig.apiUrl,
      user: account,
      chainId,
    });
    if (!txHash) {
      throw new Error("Swap failed");
    }
    return txHash;
  } catch (error) {
    swapAnalytics.onSwapFailed((error as any).message, count());
    throw error;
  }
};

async function waitForSwap({
  chainId,
  user,
  apiUrl,
  sessionId,
}: {
  chainId: number;
  user: string;
  apiUrl: string;
  sessionId: string;
}) {
  // wait for swap to be processed, check every 2 seconds, for 2 minutes
  for (let i = 0; i < 60; ++i) {
    await delay(2_000);
    try {
      const response = await fetch(
        `${apiUrl}/swap/status/${sessionId}?chainId=${chainId}`,
        {
          method: "POST",
          body: JSON.stringify({ user }),
        }
      );
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.txHash) {
        return result.txHash as string;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
