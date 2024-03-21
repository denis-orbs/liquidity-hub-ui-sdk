import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useFormatNumber } from "./useFormatNumber";
import { useSwapButton } from "./useSwapButton";
import BN from "bignumber.js";
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
  const { data: quote, isLoading } = useQuote();
  return {
    value: useFormatNumber({ value: quote?.minAmountOutUI }),
    isLoading,
  };
};

export function useGasCost() {
  const toTokenUsd = useSwapState(useShallow((s) => s.toTokenUsd));
  const quote = useQuote().data;

  return useMemo(() => {
    if (!quote?.gasCostOutputToken || !toTokenUsd) return "";
    return BN(quote?.gasCostOutputToken).multipliedBy(toTokenUsd).toString();
  }, [quote?.gasCostOutputToken, toTokenUsd]);
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
    fromTokenUsd: BN(store.fromTokenUsd || 0).isZero() ? undefined :store.fromTokenUsd ,
    toTokenUsd: BN(store.toTokenUsd || 0).isZero() ? undefined :store.toTokenUsd ,
    swapButton: useSwapButton(),
    title,
    gasCost: useGasCost(),
    rate: useRate(),
    minAmountOut: useMinAmountOut().value,
  };
};
