import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { api } from "../../api";
import { QUERY_KEYS } from "../../config/consts";
import { useMainContext } from "../../context/MainContext";
import { Token } from "../../type";
import { useIsInvalidChain } from "./useIsInvalidChain";

export const useTokensList = () => {
  const {
    chainId: connectedChainId,
    supportedChains,
    getTokens: getTokensContext,
  } = useMainContext();
  const invalidChain = useIsInvalidChain();
 

  return useQuery<Token[]>({
    queryFn: async () => {
      const firstSupportedChain = _.first(supportedChains);
      const chainId = invalidChain
        ? firstSupportedChain
        : connectedChainId || firstSupportedChain;

      if (!chainId) return [];

      let tokens: Token[] = [];

      if (getTokensContext) {
        tokens = await getTokensContext(chainId) || [];
      }

      if (!_.size(tokens)) {
        tokens = await api.getTokensByChainId(chainId!)
      }      

      return tokens || [];
    },
    queryKey: [QUERY_KEYS.TOKENS_LIST, connectedChainId],
    staleTime: Infinity,
  });
};
