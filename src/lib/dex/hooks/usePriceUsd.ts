import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";
import { QUERY_KEYS } from "../../config/consts";
import { useChainConfig, useIsInvalidChain } from "../../hooks";
import { isNativeAddress } from "../../util";


export const usePriceUsd = ({
  address,
  refetchInterval = 30_000,
  noRefetch,
}: {
  address?: string;
  refetchInterval?: number;
  noRefetch?: boolean;
}) => {
  const chainConfig = useChainConfig();
  const chainId = chainConfig?.chainId;
  const wTokenAddress = chainConfig?.wToken?.address;
  const invalidChain = useIsInvalidChain()
  return useQuery({
    queryFn: async () => {
      if (
        !chainId ||
        !address ||
        !wTokenAddress ||
        !chainConfig ||
        invalidChain
      )
        return 0;

      const _address = isNativeAddress(address) ? wTokenAddress : address;

    
      return api.priceUsd(_address, chainId);
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: noRefetch ? false : refetchInterval,
    staleTime: Infinity,
    retry: 2,
  });
};
