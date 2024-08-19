import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Token, useAllowanceCallback } from "../..";
import { QUERY_KEYS } from "../../config/consts";
import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import Web3 from "web3";


export const useAllowanceQuery = (
  account?: string,
  web3?: Web3,
  chainId?: number,
  fromAmount?: string,
  fromToken?: Token
) => {
  const queryClient = useQueryClient();
  const getAllowance = useAllowanceCallback( account, web3, chainId, fromAmount, fromToken);
  
  const queryKey = [
    QUERY_KEYS.APPROVE,
    account,
    chainId,
    fromToken?.address,
    fromAmount,
  ];
  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => {      
      return getAllowance();
    },
    enabled:
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
