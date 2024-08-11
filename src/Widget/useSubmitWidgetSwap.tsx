import { isNativeAddress } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Quote,
  SwapStatus,
  SwapSteps,
  Token,
  useApproveCallback,
  useGetTxReceiptCallback,
  useSignCalback,
  useSwapCallback,
  useWrapCallback,
} from "../lib";
import { useOnSwapSuccessCallback } from "../lib/hooks/swap/useSwapStatusCallbacks";

export const useSubmitWidgetSwap = (
  fromAmountRaw?: string,
  fromToken?: Token,
  toToken?: Token,
  hasAllowance?: boolean
) => {
  const [swapStatus, setSwapStatus] = useState<SwapStatus>(undefined);
  const [swapStep, setSwapStep] = useState<SwapSteps>(undefined);
  const [isWrapped, setIsWrapped] = useState(false);
  const getReceipt = useGetTxReceiptCallback();
  const approve = useApproveCallback(fromToken);
  const wrapCallback = useWrapCallback();
  const signCallback = useSignCalback();
  const swapCallback = useSwapCallback();
  const onSuccess = useOnSwapSuccessCallback();

  const mutation = useMutation({
    mutationFn: async (quote?: Quote) => {
      if (!quote) throw new Error("Missing quote");
      if (!fromAmountRaw) throw new Error("Missing amount");
      if (!fromToken || !toToken) throw new Error("Missing token");

      setSwapStatus("loading");
      if (isNativeAddress(fromToken.address)) {
        setSwapStep("wrap");
        await wrapCallback(fromAmountRaw);
        setIsWrapped(true);
      }
      if (!hasAllowance) {
        setSwapStep("approve");
        await approve();
      }

      setSwapStep("sign");
      const signature = await signCallback(quote.permitData);
      setSwapStep("swap");
      const txHash = await swapCallback({
        fromToken,
        toToken,
        fromAmount: fromAmountRaw,
        signature,
        quote,
      });

      const result = await getReceipt(txHash);
      onSuccess({ quote, fromToken, toToken, txHash });
      return result;
    },
    onSuccess: () => {
      setSwapStatus("success");
    },
    onError: () => {
      setSwapStatus("failed");
    },
  });

  return {
    ...mutation,
    swapStatus,
    swapStep,
    isWrapped,
  };
};
