import { useTokenListBalances } from "./useTokenListBalances";

export function useTokenListBalance(token?: string) {
  const balances = useTokenListBalances().data;
  return balances && token ? balances[token] : undefined;
}
