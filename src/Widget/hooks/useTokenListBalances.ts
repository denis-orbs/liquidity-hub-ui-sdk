import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useWidgetContext } from "../context";
import { getBalances } from "../getBalances";
import { useTokensList } from "./useTokenList";

export const useTokenListBalances = () => {
  const list = useTokensList().data;
  const { account, web3, chainId } = useWidgetContext();
  
  return useQuery({
    queryKey: [
      "useTokenListBalances",
      account,
      chainId,
      _.size(list),
      web3?.version,
    ],
    queryFn: async () => {
      if (!account || !chainId || !list || !web3) return {};
      const balances = await getBalances(list!, web3, account);      
      return balances;
    },
    refetchInterval: 30_000,
    staleTime: Infinity,
  });
};
