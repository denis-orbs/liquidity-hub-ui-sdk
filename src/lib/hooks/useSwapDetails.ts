import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { amountBN, amountUi, estimateGasPrice, isNativeAddress } from "../util";
import { useQuote } from "./swap";
import BN from "bignumber.js";
import { QUERY_KEYS } from "../config/consts";
import { useMainContext } from "../provider";
import { useQuery } from "@tanstack/react-query";
import { useAmountUI } from "./useAmountUI";
import { Token, useAllowance, useSubmitSwap } from "..";
import { getBalances } from "../multicall";

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



const useBalance = (token?: Token) => {
  const { account, web3 } = useMainContext();

  return useQuery({
    queryKey: [QUERY_KEYS.TOKEN_BALANCE, token?.address, account],
    queryFn: async () => {
      const result = await getBalances([token!], web3!, account!);
      const balance = amountBN(token?.decimals, result[token?.address!]);
      return balance.toString();
    },
    enabled: !!account && !!token && !!web3,
  });
};


export function usePriceChanged() {
  const quote = useQuote().data;
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);
  const { showConfirmation, toToken, originalQuote, swapStatus } = useSwapState(
    useShallow((s) => ({
      showConfirmation: s.showConfirmation,
      toToken: s.toToken,
      originalQuote: s.originalQuote,
      swapStatus: s.swapStatus,
    }))
  );

  useEffect(() => {
    // initiate
    if (showConfirmation && !acceptedAmountOut) {
      setAcceptedAmountOut(originalQuote?.minAmountOut);
    }
  }, [originalQuote, acceptedAmountOut, showConfirmation]);

  const acceptChanges = useCallback(() => {
    setAcceptedAmountOut(quote?.minAmountOut);
  }, [setAcceptedAmountOut, quote?.minAmountOut]);

  const shouldAccept = useMemo(() => {
    if (!acceptedAmountOut || !quote?.minAmountOut || swapStatus) return false;

    if (BN(quote.minAmountOut).isLessThan(BN(acceptedAmountOut))) {
      return true;
    }
  }, [acceptedAmountOut, quote?.minAmountOut, swapStatus]);

  return {
    shouldAccept,
    acceptChanges,
    newPrice: useAmountUI(toToken?.decimals, quote?.minAmountOut),
  };
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
  const { data: balance, isLoading: loadingBalance } = useBalance(store.fromToken);

  const modalTitle = useMemo(() => {
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
  const { data: approved, isLoading: allowanceLoading } = useAllowance();
  const submitSwap = useSubmitSwap();
    const priceChangedWarning = usePriceChanged();
  const buttonContent = useMemo(() => {

    if (BN(balance || "0").isLessThan(store.fromAmount || "0")) {
      return 'Insufficient balance'
    }

    if (BN(outAmount || "0").isLessThan(0)) {
      return 'No liquidity for this trade'
    }

    if (isNativeAddress(store.fromToken?.address || "")) return "Wrap and Swap";
    if (!approved) return "Approve and Swap";
    return "Sign and Swap";
  }, [approved, store.fromToken, store.fromAmount, outAmount, balance]);




  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: fromAmountUI,
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    isOpen: !!store.showConfirmation,
    onClose: store.onCloseSwap,
    modalTitle,
    outAmount,
    swapLoading: store.swapStatus === "loading",
    submitButton: {
      content: buttonContent,
      disabled: allowanceLoading || loadingBalance,
      onSwap:submitSwap,
    },
    priceChangedWarning,
  };
};
