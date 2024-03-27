import { useGlobalStore, useSwapState } from "../store/main";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { swapAnalytics } from "../analytics";
import { counter, waitForTxReceipt } from "../util";
import { useApiUrl } from "./useApiUrl";
import { useShallow } from "zustand/react/shallow";
import { QuoteResponse } from "../type";

interface Args {
  signature: string;
  inTokenAddress: string;
  outTokenAddress: string;
  fromAmount: string;
  quote: QuoteResponse;
}

export const useSwapX = () => {
  const { account, chainId, web3 } = useMainContext();
  const updateState = useSwapState(useShallow((s) => s.updateState));
  const apiUrl = useApiUrl();
  const sessionId = useGlobalStore((s) => s.sessionId);
  return useCallback(
    async (args:Args) => {
      if (
        !account ||
        !web3 ||
        !chainId ||
        !apiUrl ||
        !args.signature ||
        !args.fromAmount
      ) {
        throw new Error("Missing args");
      }

      let txDetails;
      const count = counter();
      swapAnalytics.onSwapRequest();
      try {
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
        txDetails = await waitForTxReceipt(web3, swap.txHash);
        if (txDetails?.mined) {
          swapAnalytics.onClobOnChainSwapSuccess();
          updateState({
            swapStatus: "success",
            txHash: swap.txHash,
          });

          return swap.txHash as string;
        } else {
          throw new Error(txDetails?.revertMessage);
        }
      } catch (error: any) {
        const msg = error.message.error || error.message;
        swapAnalytics.onSwapFailed(msg, count(), !!txDetails?.revertMessage);
        throw new Error('Swap failed');
      }
    },
    [web3, account, chainId, updateState, sessionId, apiUrl]
  );
};