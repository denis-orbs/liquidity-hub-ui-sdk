import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { amountUi, estimateGasPrice } from "../util";
import { useQuote } from "./swap";
import BN from "bignumber.js";
import { QUERY_KEYS } from "../config/consts";
import { useMainContext } from "../provider";
import { useQuery } from "@tanstack/react-query";
import { useAmountUI } from "./useAmountUI";

export function useUsdAmounts() {
  const outAmount = useQuote().data?.outAmount;

  const { fromToken, fromAmount, inTokenUsd, toToken, outTokenUsd } =
    useSwapState(
      useShallow((s) => ({
        fromToken: s.fromToken,
        fromAmount: s.fromAmount,
        inTokenUsd: s.inTokenUsd,
        toToken: s.toToken,
        outTokenUsd: s.outTokenUsd,
      }))
    );

  return useMemo(() => {
    return {
      inTokenUsdAmount: amountUi(
        fromToken?.decimals,
        BN(fromAmount || "0").multipliedBy(inTokenUsd || "0")
      ),
      outTokenUsdAmount: amountUi(
        toToken?.decimals,
        BN(outAmount || "0").multipliedBy(outTokenUsd || "0")
      ),
    };
  }, [fromToken, fromAmount, inTokenUsd, toToken, outAmount, outTokenUsd]);
}

export function usePriceImpact() {
  const { inTokenUsdAmount, outTokenUsdAmount } = useUsdAmounts();

  return useMemo(() => {
    if (
      BN(outTokenUsdAmount || "0").isZero() ||
      BN(inTokenUsdAmount || "0").isZero()
    )
      return;
    return BN(outTokenUsdAmount)
      .div(inTokenUsdAmount)
      .minus(1)
      .times(100)
      .toString();
  }, [inTokenUsdAmount, outTokenUsdAmount]);
}

export function useGasCostUsd() {
  const outTokenUsd = useSwapState(useShallow((s) => s.outTokenUsd));
  const gasCostOutputToken = useQuote().data?.gasCostOutputToken;
  const toToken = useSwapState(useShallow((s) => s.toToken));
  return useMemo(() => {
    if (!gasCostOutputToken || !outTokenUsd) return;
    return amountUi(
      toToken?.decimals,
      BN(gasCostOutputToken).multipliedBy(outTokenUsd)
    );
  }, [gasCostOutputToken, outTokenUsd, toToken]);
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
  };
};
