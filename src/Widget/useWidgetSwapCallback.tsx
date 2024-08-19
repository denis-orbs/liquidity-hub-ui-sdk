import { isNativeAddress } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import {
  getTxReceipt,
  RejectedError,
  signPermitData,
  swapCallback,
  SwapStatus,
  SwapStep,
  useAmountBN,
  useApproveCallback,
  useSwapState,
  useWrapCallback,
} from "../lib";
import { useWidgetContext } from "./context";
import { useWidgetQuote } from "./hooks/useWidgetQuote";

export const useWidgetSwapCallback = () => {
  const {
    state: { fromToken, toToken, fromAmountUi },
    hasAllowance,
    web3,
    account,
    chainId,
    updateState
  } = useWidgetContext();
  const { onSwapStep, onSwapStatus, onWrappedNativeToken } = useSwapState();
  const approve = useApproveCallback(account, web3, chainId, fromToken);
  const wrapCallback = useWrapCallback(account, web3, chainId);
  const { data: quote } = useWidgetQuote();

  const fromAmountRaw = useAmountBN(fromToken?.decimals, fromAmountUi);

  return useMutation({
    mutationFn: async () => {
      if (!quote) throw new Error("Missing quote");
      if (!fromAmountRaw) throw new Error("Missing amount");
      if (!fromToken || !toToken) throw new Error("Missing token");
      if (!web3) throw new Error("Missing web3");
      if (!account) throw new Error("Missing account");
      if (!chainId) throw new Error("Missing chainId");
      onSwapStatus(SwapStatus.LOADING);

      if (isNativeAddress(fromToken.address)) {
        onSwapStep(SwapStep.WRAP);
        await wrapCallback(fromAmountRaw);
        onWrappedNativeToken();
      }

      if (!hasAllowance) {
        onSwapStep(SwapStep.APPROVE);
        await approve();
      }

      onSwapStep(SwapStep.SIGN_AND_SEND);

      const signature = await signPermitData(account, web3, quote.permitData);

      const txHash = await swapCallback(
        fromAmountRaw,
        fromToken,
        toToken,
        quote,
        signature,
        account,
        chainId
      );
      updateState({ txHash });
      const result = await getTxReceipt(web3, txHash);
      return result;
    },
    onSuccess: () => {
      onSwapStatus(SwapStatus.SUCCESS);
    },
    onError: (error) => {
      console.log({ error });

      onSwapStatus(
        error instanceof RejectedError ? undefined : SwapStatus.FAILED
      );
    },
  });
};
