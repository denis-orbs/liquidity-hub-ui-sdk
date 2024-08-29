import { useCallback } from "react";
import { Token, useAmountUI } from "../../lib";
import { useWidgetContext } from "../context";
import { useTokenListBalance } from "./useTokenListBalance";
import { useTokenListBalances } from "./useTokenListBalances";
import { useWidgetQuote } from "./useWidgetQuote";

export * from "./usePercentSelect";
export * from "./useRefreshBalancesAfterTx";
export * from "./useShowConfirmationButton";
export * from "./useTokenListBalances";
export * from "./useTokenListBalance";
export * from "./useTokenList";
export * from "./useTokens";
export * from "./useInitialTokens";
export * from "./usePriceUsd";
export * from "./useRate";
export * from "./usePriceImpact";

export const useSetMaxBalance = () => {
  const {
    updateState,
    state: { fromToken },
  } = useWidgetContext();

  const { balance } = useTokenListBalance(fromToken?.address);

  return useCallback(() => {
    updateState({ fromAmountUi: balance || "" });
  }, [balance, updateState]);
};

export const useBalancesLoading = () => {
  const balances = useTokenListBalances().data;
  const loadingAfterTx = useWidgetContext().state.fetchingBalancesAfterTx;

  return !balances || loadingAfterTx;
};

export function useFromTokenPanel() {
  const {
    updateState,
    state: { fromToken, fromAmountUi },
  } = useWidgetContext();

  const { balance } = useTokenListBalance(fromToken?.address);

  const onTokenSelect = useCallback(
    (token: Token) => {
      updateState({ fromToken: token });
    },
    [updateState]
  );

  const onChange = useCallback(
    (fromAmountUi: string) => {
      updateState({ fromAmountUi });
    },
    [updateState]
  );

  return {
    token: fromToken,
    amount: fromAmountUi,
    onTokenSelect,
    onChange,
    balance,
  };
}

export function useToTokenPanel() {
  const {
    state: { toToken },
    updateState,
  } = useWidgetContext();
  const balance = useTokenListBalance(toToken?.address).balance;
  const {data: quote} = useWidgetQuote()
  const outAmountUi = useAmountUI(toToken?.decimals, quote?.outAmount)

  const onTokenSelect = useCallback(
    (token: Token) => {
      updateState({ toToken: token });
    },
    [updateState]
  );

  return {
    token: toToken,
    onTokenSelect,
    balance,
    amount: outAmountUi
  };
}
