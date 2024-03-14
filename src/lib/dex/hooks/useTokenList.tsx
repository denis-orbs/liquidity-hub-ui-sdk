import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useShallow } from "zustand/react/shallow";
import { api } from "../../api";
import { QUERY_KEYS } from "../../config/consts";
import { useIsInvalidChain } from "../../hooks";
import { useMainContext } from "../../provider";
import { useDexState } from "../../store/dex";
import { Token } from "../../type";
import { findTokenInList, getChainConfig } from "../../util";

export const useTokensList = () => {
  const invalidChain = useIsInvalidChain();
  const { account, chainId: connectedChainId, initialFromToken, initialToToken, supportedChains } =
    useMainContext();
  const { fromToken, toToken, updateStore } = useDexState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      updateStore: s.updateStore,
    }))
  );

  return useQuery<Token[]>({
    queryFn: async () => {

      const chainId = connectedChainId || _.first(supportedChains);
      const chainConfig = getChainConfig(chainId);
      const tokens =
        (await chainConfig?.getTokens?.()) ||
        (await api.getTokens(chainId!)) ||
        [];
      if (!fromToken && initialFromToken) {
        updateStore({
          fromToken: findTokenInList(tokens || [], initialFromToken),
        });
      }
      if (!toToken && initialToToken) {
        updateStore({ toToken: findTokenInList(tokens || [], initialToToken) });
      }

      return tokens;
    },
    queryKey: [QUERY_KEYS.TOKENS_LIST, connectedChainId, account],
    staleTime: Infinity,
    enabled: !invalidChain,
  });
};
