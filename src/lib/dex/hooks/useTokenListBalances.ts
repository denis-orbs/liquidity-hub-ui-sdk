import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { QUERY_KEYS } from "../../config/consts";
import { useIsInvalidChain } from "../../hooks";
import { getBalances } from "../../multicall";
import { useMainContext } from "../../provider";
import { useTokensList } from "./useTokenList";

export const useTokenListBalances = () => {
  const list = useTokensList().data;
  const invalidChain = useIsInvalidChain();

  const { chainId, account, web3 } = useMainContext();

  return useQuery({
    queryKey: [
      QUERY_KEYS.BALANCES,
      account,
      chainId,
      _.size(list),
      web3?.version,
    ],
    queryFn: async () => {
      if (!account || !chainId || !list || invalidChain || !web3) return {};
      return getBalances(list!, web3, account);
    },
    refetchInterval: 30_000,
    staleTime: Infinity,
  });
};
