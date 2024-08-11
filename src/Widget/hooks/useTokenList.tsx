import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { Token } from "../../lib";
import { useMainContext } from "../../lib/context/MainContext";
import { api } from "../api";
import { useIsInvalidChain } from "./useIsInvalidChain";

export const useTokensList = () => {
  const { chainId: connectedChainId, supportedChains } = useMainContext();
  const invalidChain = useIsInvalidChain();

  return useQuery<Token[]>({
    queryFn: async () => {
      const firstSupportedChain = _.first(supportedChains);
      const chainId = invalidChain
        ? firstSupportedChain
        : connectedChainId || firstSupportedChain;

      if (!chainId) return [];

      let tokens = await api.getTokensByChainId(chainId!);
      
      return tokens || [];
    },
    queryKey: ["useTokensList", connectedChainId],
    staleTime: Infinity,
  });
};
