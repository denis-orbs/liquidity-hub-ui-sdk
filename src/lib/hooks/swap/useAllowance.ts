import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContract } from "../..";
import { permit2Address, QUERY_KEYS } from "../../config/consts";
import BN from "bignumber.js";
import { useMainContext } from "../../context/MainContext";
import { useCallback } from "react";

const useGetAllowance = () => {
  const { account, state } = useMainContext();

  const fromTokenContract = useContract(state.fromToken?.address);

  return useCallback(async () => {
    const allowance = await fromTokenContract?.methods
      ?.allowance(account, permit2Address)
      .call();

    return BN(allowance?.toString() || "0").gte(state.fromAmount!);
  }, [fromTokenContract, account, state.fromToken?.address, state.fromAmount]);
};

const useAllowanceKey = () => {
  const { account, chainId, state } = useMainContext();

  return [
    QUERY_KEYS.APPROVE,
    account,
    chainId,
    state.fromToken?.address,
    state.fromAmount,
  ];
};

export const useAllowance = () => {
  const { account, chainId, state } = useMainContext();

  const fromTokenContract = useContract(state.fromToken?.address);
  const getAllowance = useGetAllowance();
  const queryKey = useAllowanceKey();
  return useQuery({
    queryKey: queryKey,
    queryFn: getAllowance,
    enabled:
      !!fromTokenContract &&
      !!state.fromToken?.address &&
      !!account &&
      !!chainId &&
      !!state.fromAmount &&
      BN(state.fromAmount).gt(0),
    staleTime: Infinity,
  });
};

export const useEnsureAllowance = () => {
  const queryClient = useQueryClient();
  const getAllowance = useGetAllowance();
  const queryKey = useAllowanceKey();

  return useCallback(async () => {
    return  queryClient.ensureQueryData({ queryKey, queryFn: getAllowance });
  }, [queryClient, queryKey, getAllowance]);
};
