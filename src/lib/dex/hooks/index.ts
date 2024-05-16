import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDexState } from "../../store/dex";
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

export const useInputChange = () => {
  const onFromAmountChange = useDexState(
    useShallow((s) => s.onFromAmountChange)
  );

  return useCallback(
    (value: string) => {
      onFromAmountChange(value);
    },
    [onFromAmountChange]
  );
}

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


export function useTokenBalance(address?: string) {
  return  useTokenListBalance(address).balance;
}

export function useSelectToken(isSrc?: boolean) {
  const {  onTokenSelect,onFromTokenSelect  } = useDexState((s) => ({
    onTokenSelect: s.onToTokenChange,
    onFromTokenSelect: s.onFromTokenChange,
  }));

  return isSrc ? onFromTokenSelect : onTokenSelect
}


export function useSwapTokens() {
  return useDexState((store) => store.onSwitchTokens);
}
