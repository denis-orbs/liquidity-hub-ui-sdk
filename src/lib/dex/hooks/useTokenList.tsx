import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { api } from "../../api";
import { QUERY_KEYS } from "../../config/consts";
import { useIsInvalidChain } from "../../hooks";
import { useMainContext } from "../../provider";
import { Token } from "../../type";
import { getChainConfig } from "../../util";


export const useTokensList = () => {
  const invalidChain = useIsInvalidChain();
  const { web3, account, chainId } = useMainContext();

  const waitForWeb3 = account && !web3;

  return useQuery<Token[]>({
    queryFn: async () => {
      const chainConfig = getChainConfig(chainId);
      return chainConfig?.getTokens
        ? chainConfig.getTokens()
        : api.getTokens(chainId!) || [];
    },
    queryKey: [QUERY_KEYS.TOKENS_LIST, chainId, account],
    staleTime: Infinity,
    enabled: !invalidChain && !waitForWeb3,
  });
};
