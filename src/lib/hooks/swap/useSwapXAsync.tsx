// import { useCallback } from "react";
// import { useMainContext } from "../../provider";
// import { swapAnalytics } from "../../analytics";
// import { counter, delay, waitForTxReceipt } from "../../util";
// import { useApiUrl } from "./useApiUrl";

// import { QuoteResponse } from "../../type";

// export const useSwapXAsync = ({ sessionId }: { sessionId?: string }) => {
//   const { account, chainId, web3 } = useMainContext();
//   const apiUrl = useApiUrl();
//   return useCallback(
//     async ({
//       inTokenAddress,
//       outTokenAddress,
//       signature,
//       fromAmount,
//       quote,
//     }: {
//       signature: string;
//       inTokenAddress: string;
//       outTokenAddress: string;
//       fromAmount: string;
//       quote: QuoteResponse;
//     }) => {
//       if (
//         !account ||
//         !web3 ||
//         !chainId ||
//         !apiUrl ||
//         !signature ||
//         !fromAmount
//       ) {
//         throw new Error("Missing args");
//       }

//       let txDetails;
//       const count = counter();
//       swapAnalytics.onSwapRequest();
//       try {
//         await fetch(`${apiUrl}/swap-async?chainId=${chainId}`, {
//           method: "POST",
//           body: JSON.stringify({
//             ...quote,
//             inToken: inTokenAddress,
//             outToken: outTokenAddress,
//             inAmount: fromAmount,
//             user: account,
//             signature: signature,
//           }),
//         });
//         const txHash = await waitForSwap(chainId, apiUrl, sessionId);
//         if (!txHash) {
//           throw new Error("Missing txHash");
//         }
//         swapAnalytics.onSwapSuccess(txHash, count());
//         txDetails = await waitForTxReceipt(web3, txHash);
//         if (txDetails?.mined) {
//           swapAnalytics.onClobOnChainSwapSuccess();
//           updateState({
//             swapStatus: "success",
//             txHash: txHash,
//           });

//           return txHash as string;
//         } else {
//           throw new Error(txDetails?.revertMessage);
//         }
//       } catch (error: any) {
//         const msg = error.message.error || error.message;
//         swapAnalytics.onSwapFailed(msg, count());
//         throw new Error(msg);
//       }
//     },
//     [web3, account, chainId, updateState, sessionId, apiUrl]
//   );
// };

// async function waitForSwap(
//   chainId: number,
//   apiUrl: string,
//   sessionId?: string
// ) {
//   if (!sessionId) {
//     throw new Error("Missing sessionId");
//   }
//   for (let i = 0; i < 120; ++i) {
//     await delay(2_000);
//     try {
//       const response = await fetch(
//         `${apiUrl}/swap/status/${sessionId}?chainId=${chainId}`
//       );
//       const result = await response.json();
//       if (result.error) {
//         throw new Error(result.error);
//       }

//       if (result.txHash) {
//         return result.txHash as string;
//       }
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   }
// }

// export {};


export {}