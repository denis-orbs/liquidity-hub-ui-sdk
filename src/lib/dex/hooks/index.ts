import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDexLH, useTokenListBalance, useTokenListBalances } from "../..";
import { useDexState } from "../../store/dex";

export * from "./useDexLH";
export * from "./usePercentSelect";
export * from "./usePriceUsd";
export * from "./useRefreshBalancesAfterTx";
export * from "./useShowConfirmationButton";
export * from "./useUsdAmount";
export * from "./useTokenListBalances";
export * from "./useTokenListBalance";
export * from "./useTokenList";
export * from "./useTokens";
export * from "./useNetworkFee";
export * from "./useOnSwapSuccess";

export const useSetMaxBalance = () => {
  const onFromAmountChange = useDexState(
    useShallow((s) => s.onFromAmountChange)
  );

  const { balance } = useTokenListBalance(useFromToken()?.address);

  return useCallback(() => {
    onFromAmountChange(balance || "");
  }, [balance, onFromAmountChange]);
};

export const useBalancesLoading = () => {
  const balances = useTokenListBalances().data;
  const loadingAfterTx = useDexState(
    useShallow((s) => s.fetchingBalancesAfterTx)
  );

  return !balances || loadingAfterTx;
};

export const useFromToken = () => {
  return useDexState(useShallow((s) => s.fromToken));
};

export const useToToken = () => {
  return useDexState(useShallow((s) => s.toToken));
};

export const useFromTokenBalance = () => {
  return useTokenListBalance(useFromToken()?.address);
};

export const useToTokenBalance = () => {
  return useTokenListBalance(useToToken()?.address);
};

export const useFromTokenAmount = () => {
  return useDexState(useShallow((s) => s.fromAmount));
};

export const useToTokenAmount = () => {
  return useDexLH().quote?.outAmountUI;
};

export function useFromTokenPanel() {
  const { token, amount, onTokenSelect, onChange } = useDexState((s) => ({
    token: s.fromToken,
    amount: s.fromAmount,
    onTokenSelect: s.onFromTokenChange,
    onChange: s.onFromAmountChange,
  }));
  const { balance } = useTokenListBalance(token?.address);

  return {
    token,
    amount,
    onTokenSelect,
    onChange,
    balance,
  };
}

export function useToTokenPanel() {
  const { token, onTokenSelect } = useDexState((s) => ({
    token: s.toToken,
    onTokenSelect: s.onToTokenChange,
  }));

  const amount = useDexLH().quote?.outAmountUI;
  const { balance } = useTokenListBalance(token?.address);

  return {
    token,
    amount,
    onTokenSelect,
    balance,
  };
}

export function useSwapTokens() {
  return useDexState((store) => store.onSwitchTokens);
}
