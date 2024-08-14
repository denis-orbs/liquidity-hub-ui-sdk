import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Token, useContract } from "../..";
import { QUERY_KEYS } from "../../config/consts";
import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { permit2Address } from "@defi.org/web3-candies";
import Web3 from "web3";

const useGetAllowance = (
  account?: string,
  web3?: Web3,
  chainId?: number,
  fromAmount?: string,
  fromToken?: Token
) => {
  const fromTokenContract = useContract(fromToken?.address, web3, chainId);

  return useCallback(async () => {
    const allowance = await fromTokenContract?.methods
      ?.allowance(account, permit2Address)
      .call();

    return BN(allowance?.toString() || "0").gte(fromAmount!);
  }, [fromTokenContract, account, fromToken?.address, fromAmount]);
};

export const useAllowance = (
  account?: string,
  web3?: Web3,
  chainId?: number,
  fromAmount?: string,
  fromToken?: Token
) => {
  const queryClient = useQueryClient();
  const fromTokenContract = useContract(fromToken?.address, web3, chainId);
  const getAllowance = useGetAllowance( account, web3, chainId, fromAmount, fromToken);

  const queryKey = [
    QUERY_KEYS.APPROVE,
    account,
    chainId,
    fromToken?.address,
    fromAmount,
  ];
  const query = useQuery({
    queryKey: queryKey,
    queryFn: getAllowance,
    enabled:
      !!fromTokenContract &&
      !!fromToken?.address &&
      !!account &&
      !!chainId &&
      BN(fromAmount || 0).gt(0),
    staleTime: Infinity,
  });

  const ensureAllowance = useCallback(async () => {
    return queryClient.ensureQueryData({ queryKey, queryFn: getAllowance });
  }, [queryClient, queryKey, getAllowance]);

  return useMemo(() => {
    return {
      ...query,
      ensureAllowance,
    };
  }, [query, ensureAllowance]);
};
