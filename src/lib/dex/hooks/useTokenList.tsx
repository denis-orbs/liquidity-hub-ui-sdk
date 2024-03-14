import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { api } from "../../api";
import { QUERY_KEYS } from "../../config/consts";
import { useIsInvalidChain } from "../../hooks";
import { useMainContext } from "../../provider";
import { Token } from "../../type";
import { getChainConfig } from "../../util";

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

      const chainConfig = getChainConfig(chainId);
      let tokens: Token[] = [];

      if (getTokensContext) {
        tokens = await getTokensContext(chainId) || [];
      }

      if (!_.size(tokens)) {
        tokens =
          (await chainConfig?.getTokens?.()) ||
          (await api.getTokens(chainId!)) ||
          [];
      }      

      return tokens;
    },
    queryKey: [QUERY_KEYS.TOKENS_LIST, connectedChainId],
    staleTime: Infinity,
  });
};
