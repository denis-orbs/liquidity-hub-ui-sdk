import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useMainContext } from "../../lib/context/MainContext";
import { getBalances } from "../getBalances";
import { useIsInvalidChain } from "./useIsInvalidChain";
import { useTokensList } from "./useTokenList";

export const useTokenListBalances = () => {
  const list = useTokensList().data;
  const invalidChain = useIsInvalidChain();

  const { chainId, account, web3 } = useMainContext();

  return useQuery({
    queryKey: [
      'useTokenListBalances',
      account,
      chainId,
      _.size(list),
      web3?.version,
    ],
    queryFn: async () => {      
      if (!account || !chainId || !list || invalidChain || !web3) return {};            
      const balances = await getBalances(list!, web3, account);
      
      return balances;
    },
    refetchInterval: 30_000,
    staleTime: Infinity,
  });
};
