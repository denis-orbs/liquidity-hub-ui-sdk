import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useQuote } from "../../hooks/useQuote";
import { useDexState } from "../../store/dex";
import { useDexLH } from "./useDexLH";
import { useTokenListBalance } from "./useTokenListBalance";
import { useTokenListBalances } from "./useTokenListBalances";

export * from "./useDexLH";
export * from "./usePercentSelect";
export * from "./useRefreshBalancesAfterTx";
export * from "./useShowConfirmationButton";
export * from "./useTokenListBalances";
export * from "./useTokenListBalance";
export * from "./useTokenList";
export * from "./useTokens";
export * from "./useOnSwapSuccessCallback";
export * from "./useInitialTokens";
export * from "./useUsdAmount";
export * from "./usePriceUsd";

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
  return useDexLH().quote?.data?.ui.outAmount;
};

export function useFromTokenPanel() {
  const { token, amount, onTokenSelect, onChange } = useDexState((s) => ({
    token: s.fromToken,
    amount: s.fromAmount,
    onTokenSelect: s.onFromTokenChange,
    onChange: s.onFromAmountChange,
  }));

  const { balance } = useTokenListBalance(token?.address);
  const { data: quote, isLoading } = useQuote();
  return {
    token,
    amount,
    onTokenSelect,
    onChange,
    balance,
    usd: quote?.ui.inAmountUsd,
    usdLoading: isLoading,
  };
}

export function useToTokenPanel() {
  const { token, onTokenSelect } = useDexState((s) => ({
    token: s.toToken,
    onTokenSelect: s.onToTokenChange,
  }));

  const balance = useTokenListBalance(token?.address).balance;

  const { data, isLoading } = useQuote();
  return {
    token,
    amount: data?.ui.outAmount,
    onTokenSelect,
    balance,
    usd: data?.ui.outAmountUsd,
    usdLoading: isLoading,
  };
}

export function useSwapTokens() {
  return useDexState((store) => store.onSwitchTokens);
}
