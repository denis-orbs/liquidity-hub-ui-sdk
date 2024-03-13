import { useQuery } from "@tanstack/react-query";
import { useMainContext } from "../provider";
import BN from 'bignumber.js'
import { QUERY_KEYS } from "../config/consts";
import { estimateGasPrice } from "../util";

export const useEstimateGasPrice = () => {
  const { web3, chainId } = useMainContext();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: async () => {
      const result = await estimateGasPrice(web3!, chainId!);
        const priorityFeePerGas = result?.fast.tip || 0;
        const maxFeePerGas = BN.max(
          result?.fast.max || 0,
          priorityFeePerGas
        );

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
