import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { Token } from "../../lib";
import { api } from "../api";
import { useWidgetContext } from "../context";

export const useTokensList = () => {
  const {chainId} = useWidgetContext()

  return useQuery<Token[]>({
    queryFn: async () => {

      let tokens = await api.getTokensByChainId(chainId!);
      
      return tokens || [];
    },
    queryKey: ["useTokensList", chainId],
    staleTime: Infinity,
  });
};
