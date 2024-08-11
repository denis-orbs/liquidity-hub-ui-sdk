import { estimateGasPrice } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import BN from "bignumber.js";
import { QUERY_KEYS } from "../config/consts";
import { useMainContext } from "../context/MainContext";

export const useEstimateGasPrice = () => {
  const { web3, chainId } = useMainContext();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: async () => {
      const result = await estimateGasPrice(undefined, undefined, web3);
      const priorityFeePerGas = result?.fast.tip || 0;
      const maxFeePerGas = BN.max(result?.fast.max || 0, priorityFeePerGas);

      return {
        result,
        priorityFeePerGas,
        maxFeePerGas,
      };
    },
    refetchInterval: 15_000,
    enabled: !!web3 && !!chainId,
  });
};
