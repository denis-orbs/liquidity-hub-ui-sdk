import { useTokenListBalances } from "./useTokenListBalances";

export function useTokenListBalance(token?: string) {
  const {data: balances, isLoading} = useTokenListBalances();
  const balance = balances && token ? balances[token] : undefined;
  return {
    balance,
    isLoading
  }
}
