import { isNativeAddress } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import {
  getTxReceipt,
  isTxRejected,
  signPermitData,
  SwapStatus,
  SwapSteps,
  useAmountBN,
  useApproveCallback,
  useSwapCallback,
  useSwapSuccessCallback,
  useWrapCallback,
} from "../lib";
import { useWidgetContext } from "./context";
import { useWidgetQuote } from "./hooks/useWidgetQuote";

export const useWidgetSwapCallback = () => {
  const {
    state: { fromToken, toToken, fromAmountUi },
    hasAllowance,
    updateState,
    web3,
    account,
    chainId,
  } = useWidgetContext();
  const approve = useApproveCallback(account, web3, chainId, fromToken);
  const wrapCallback = useWrapCallback(account, web3, chainId);
  const swapCallback = useSwapCallback();
  const onSuccess = useSwapSuccessCallback();
  const { quote } = useWidgetQuote();

  const fromAmountRaw = useAmountBN(fromToken?.decimals, fromAmountUi);

  return useMutation({
    mutationFn: async () => {
      if (!quote) throw new Error("Missing quote");
      if (!fromAmountRaw) throw new Error("Missing amount");
      if (!fromToken || !toToken) throw new Error("Missing token");
      if (!web3) throw new Error("Missing web3");
      if (!account) throw new Error("Missing account");
      if (!chainId) throw new Error("Missing chainId");
      updateState({ swapStatus: SwapStatus.LOADING });

      if (isNativeAddress(fromToken.address)) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapCallback(fromAmountRaw);
        updateState({ isWrapped: true });
      }

      if (!hasAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE });
        await approve();
      }

      updateState({ swapStep: SwapSteps.SIGN });

      const signature = await signPermitData(account, web3, quote.permitData);

      updateState({ swapStep: SwapSteps.SENT_TX });
      const txHash = await swapCallback(
        fromAmountRaw,
        fromToken,
        toToken,
        quote,
        signature,
        account,
        chainId
      );

      const result = await getTxReceipt(web3, txHash);
      onSuccess(quote, txHash, fromToken, toToken, chainId);

      return result;
    },
    onSuccess: () => {
      updateState({ swapStatus: SwapStatus.SUCCESS });
    },
    onError: (error) => {
      console.log(isTxRejected(error.message), error.message);
      
      updateState({
        swapStatus: isTxRejected(error.message) ? undefined : SwapStatus.FAILED,
      });
    },
  });
};
