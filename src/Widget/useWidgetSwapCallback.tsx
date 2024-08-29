import { isNativeAddress } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import {
  getTxReceipt,
  promiseWithTimeout,
  RejectedError,
  SIGNATURE_TIMEOUT_MILLIS,
  signPermitData,
  swapCallback,
  SwapStatus,
  SwapStep,
  TimeoutError,
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
    updateState,
  } = useWidgetContext();
  const {
    onSwapStep,
    onSwapStatus,
    onWrappedNativeToken,
  } = useSwapState();
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
      let wrappedNative = false;
      try {
        if (isNativeAddress(fromToken.address)) {
          onSwapStep(SwapStep.WRAP);
          await wrapCallback(fromAmountRaw);
          wrappedNative = true;
        }

        if (!hasAllowance) {
          onSwapStep(SwapStep.APPROVE);
          await approve();
        }

        onSwapStep(SwapStep.SIGN);

        const signature = await promiseWithTimeout(
          signPermitData(account, web3, quote.permitData),
          SIGNATURE_TIMEOUT_MILLIS
        );
        onSwapStep(SwapStep.SWAP);
        const {txHash} = await swapCallback(
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
      } catch (error) {
        console.log({ error });
        if (wrappedNative) {
          onWrappedNativeToken();
          onSwapStatus(SwapStatus.FAILED);
        } else if (
          error instanceof RejectedError ||
          error instanceof TimeoutError
        ) {
          onSwapStatus(undefined);
          onSwapStep(undefined)
        }else{
          onSwapStatus(SwapStatus.FAILED);
        }
        throw error;
      }
    },
    onSuccess: () => {
      onSwapStatus(SwapStatus.SUCCESS);
      updateState({ fromAmountUi: "" });
    },
  });
};
