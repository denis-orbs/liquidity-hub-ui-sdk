import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { amountUi, estimateGasPrice } from "../util";
import { useQuote, useSwapButton } from "./swap";
import BN from "bignumber.js";
import { QUERY_KEYS } from "../config/consts";
import { useMainContext } from "../provider";
import { useQuery } from "@tanstack/react-query";
import { useAmountUI } from "./useAmountUI";
import { useSubmitWarning } from "./useSubmitWarning";
import { usePriceChanged } from "..";

export function useGasCost() {
  const gasCostOutputToken = useQuote().data?.gasCostOutputToken;
  const toToken = useSwapState(useShallow((s) => s.toToken));
  return useMemo(() => {
    if (!gasCostOutputToken) return;
    return {
      ui: amountUi(toToken?.decimals, BN(gasCostOutputToken)),
      raw: gasCostOutputToken,
    };
  }, [gasCostOutputToken, toToken]);
}

export const useEstimateGasPrice = () => {
  const { web3, chainId } = useMainContext();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: async () => {
      const result = await estimateGasPrice(web3!, chainId!);
      const priorityFeePerGas = result?.fast.tip || 0;
      const maxFeePerGas = BN.max(result?.fast.max || 0, priorityFeePerGas);

      return {
        result,
        priorityFeePerGas,
        maxFeePerGas,
      };
    },
    refetchInterval: 15_000,
    enabled: !!web3 && !!chainId,
  });
};

export function useSlippage() {
  const contextSlippage = useMainContext().slippage;
  const storeSlippage = useSwapState(useShallow((s) => s.slippage));
  const slippage = storeSlippage || contextSlippage;

  return useMemo(() => {
    if (!slippage) return 0;
    return BN(slippage).isNaN() ? 0 : slippage;
  }, [slippage]);
}

export const useSwapConfirmation = () => {
  const warning = useSubmitWarning();
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showConfirmation: s.showConfirmation,
      fromAmount: s.fromAmount,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
    }))
  );

  const title = useMemo(() => {
    if (store.swapStatus === "failed") {
      return;
    }
    if (store.swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [store.swapStatus]);
  const fromAmountUI = useAmountUI(store.fromToken?.decimals, store.fromAmount);
  const outAmount = useAmountUI(
    store.toToken?.decimals,
    useQuote().data?.outAmount
  );

  const button = useSwapButton();

  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: fromAmountUI,
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    isOpen: !!store.showConfirmation,
    onClose: store.onCloseSwap,
    title,
    outAmount,
    warning,
    buttonText: button.text,
    swapLoading: button.isPending,
    submitSwap: button.swap,
    ...usePriceChanged(),
  };
};
