import { isNativeAddress } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { getChainConfig } from "../../lib";
import { useMainContext } from "../../lib/context/MainContext";
import { api } from "../api";


export const usePriceUsd = ({
  address,
  refetchInterval = 30_000,
  noRefetch,
  disabled,
}: {
  address?: string;
  refetchInterval?: number;
  noRefetch?: boolean;
  disabled?: boolean;
}) => {
  const { chainId: connectedChainId, supportedChains } = useMainContext();
  const chainId = connectedChainId || supportedChains?.[0];
  
  return useQuery({
    queryFn: async () => {
      if (!chainId || !address) return 0;
      const chainConfig = getChainConfig(chainId);
      const wTokenAddress = chainConfig?.wToken?.address;
      
      const _address = isNativeAddress(address) ? wTokenAddress : address;
      if (!_address) return 0;

      return api.priceUsd(_address, chainId);
    },
    queryKey: ['USD_PRICE', chainId, address],
    refetchInterval: noRefetch ? false : refetchInterval,
    staleTime: Infinity,
    retry: 2,
    enabled: !disabled,
  });
};
