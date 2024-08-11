import { isNativeAddress } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import {
  useAmountBN,
  useApproveCallback,
  useGetTxReceiptCallback,
  useSignCalback,
  useSwapCallback,
  useWrapCallback,
} from "../lib";
import { useOnSwapSuccessCallback } from "../lib/hooks/swap/useSwapStatusCallbacks";
import { useWidgetContext } from "./context";
import { useWidgetQuote } from "./hooks/useWidgetQuote";

export const useWidgetSwapCallback = () => {
  const {
    state: { fromToken, toToken, fromAmountUi },
    hasAllowance,
    updateState,
  } = useWidgetContext();
  const getReceipt = useGetTxReceiptCallback();
  const approve = useApproveCallback(fromToken);
  const wrapCallback = useWrapCallback();
  const signCallback = useSignCalback();
  const swapCallback = useSwapCallback();
  const onSuccess = useOnSwapSuccessCallback();
  const { quote } = useWidgetQuote();

  const fromAmountRaw = useAmountBN(fromToken?.decimals, fromAmountUi);

  return  useMutation({
    mutationFn: async () => {
      if (!quote) throw new Error("Missing quote");
      if (!fromAmountRaw) throw new Error("Missing amount");
      if (!fromToken || !toToken) throw new Error("Missing token");

      updateState({ swapStatus: "loading" });
      if (isNativeAddress(fromToken.address)) {
        updateState({ swapStep: "wrap" });
        await wrapCallback(fromAmountRaw);
        updateState({ isWrapped: true });
      }
      if (!hasAllowance) {
        updateState({ swapStep: "approve" });
        await approve();
      }
      updateState({ swapStep: "sign" });
      const signature = await signCallback(quote.permitData);
      updateState({ swapStep: "swap" });
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
      updateState({ swapStatus: "success" });
    },
    onError: () => {
      updateState({ swapStatus: "failed" });
    },
  });
};
