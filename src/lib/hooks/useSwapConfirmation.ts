import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useFormatNumber } from "./useFormatNumber";
import { useSwapButton } from "./useSwapButton";
import BN from "bignumber.js";
import { useUsdAmount } from "../dex/hooks";
import { useQuote } from "./useQuote";

export const useRate = () => {
  const [inverted, setInverted] = useState(false);
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd,
    }))
  );

  const value = useMemo(() => {
    if (!store.fromTokenUsd || !store.toTokenUsd) return "";

    if (!inverted) {
      return BN(store.fromTokenUsd).dividedBy(store.toTokenUsd).toString();
    }
    return BN(store.toTokenUsd).dividedBy(store.fromTokenUsd).toString();
  }, [store.fromTokenUsd, store.toTokenUsd, inverted]);

  const formattedRate = useFormatNumber({ value });
  const fromTokenUsd = useFormatNumber({ value: store.fromTokenUsd });
  const toTokenUsd = useFormatNumber({ value: store.toTokenUsd });

  const leftToken = inverted ? store.toToken?.symbol : store.fromToken?.symbol;
  const rightToken = inverted ? store.fromToken?.symbol : store.toToken?.symbol;

  const usd = useFormatNumber({
    value: BN((inverted ? fromTokenUsd : toTokenUsd) || 0)
      .multipliedBy(value)
      .toString(),
  });

  return {
    leftToken,
    rightToken,
    usd,
    value: formattedRate,
    invert: () => setInverted(!inverted),
  };
};


export const useMinAmountOut = () => {
  const {data: quote, isLoading} = useQuote();
  return {
    value: useFormatNumber({ value: quote?.minAmountOutUI }),
    isLoading
  }
};


export function useGasCost() {
  const address = useSwapState(useShallow((s) => s.toToken?.address));
  const quote = useQuote().data;

  const { usd, isLoading } = useUsdAmount(
    address,
    quote?.gasCostOutputToken || "0"
  );
  return {
    value:  quote?.gasCostOutputToken,
    usd: useFormatNumber({
      value: usd,
    }),
    isLoading,
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
      updateState: s.updateState,
      fromAmount: s.fromAmount,
      dexExpectedAmountOut: s.dexExpectedAmountOut,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd,
      minAmountOut: useMinAmountOut(),
      rate: useRate(),
    }))
  );

  const quote = useQuote().data;

  const toAmount = useMemo(() => {
    if (store.dexExpectedAmountOut) {
      return store.dexExpectedAmountOut;
    }
    return quote?.outAmount;
  }, [quote?.outAmount, store.dexExpectedAmountOut]);

  const title = useMemo(() => {
    if (store.swapStatus === "failed") {
      return;
    }
    if (store.swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [store.swapStatus]);



  

  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: useAmountUI(store.fromToken?.decimals, store.fromAmount),
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    toAmount: useAmountUI(store.toToken?.decimals, toAmount),
    open: !!store.showConfirmation,
    onClose: store.onCloseSwap,
    fromTokenUsd: store.fromTokenUsd,
    toTokenUsd: store.toTokenUsd,
    swapButton: useSwapButton(),
    title,
    minAmountOut: useFormatNumber({value: quote?.minAmountOutUI}),
    gasCost: useGasCost(),
    rate: useRate(),
  };
};
