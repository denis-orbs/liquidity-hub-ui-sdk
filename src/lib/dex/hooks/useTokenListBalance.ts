import { useTokenListBalances } from "./useTokenListBalances";

export function useTokenListBalance(token?: string) {
  const {data: balances, isLoading} = useTokenListBalances();
  return {
    balance: balances && token ? balances[token] : undefined,
    isLoading
  }
}
