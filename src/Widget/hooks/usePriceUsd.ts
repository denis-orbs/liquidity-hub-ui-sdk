import { isNativeAddress } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { getChainConfig } from "../../lib";
import { api } from "../api";
import { useWidgetContext } from "../context";

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
  const { chainId } = useWidgetContext();

  return useQuery({
    queryFn: async () => {
      const chainConfig = getChainConfig(chainId);
      const wTokenAddress = chainConfig?.wToken?.address;

      const _address = isNativeAddress(address!) ? wTokenAddress : address;
      if (!_address) return 0;

      return api.priceUsd(_address, chainId!);
    },
    queryKey: ["USD_PRICE", chainId, address],
    refetchInterval: noRefetch ? false : refetchInterval,
    staleTime: Infinity,
    retry: 2,
    enabled: !disabled && !!chainId && !!address,
  });
};
