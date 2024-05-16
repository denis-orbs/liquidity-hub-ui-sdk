import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token, useChainConfig } from "../..";
import { useMainContext } from "../../provider";
import { useContractCallback } from "../useContractCallback";
import { permit2Address, QUERY_KEYS } from "../../config/consts";
import BN from "bignumber.js";
import { isNativeAddress } from "../../util";
const useApproved = (address?: string) => {
  const { account } = useMainContext();
  const getContract = useContractCallback();
  return useCallback(
    async (fromAmount: string) => {
      try {
        const fromTokenContract = getContract(address);
        if (!account || !address || !fromAmount || !fromTokenContract) {
          return;
        }
        const allowance = await fromTokenContract?.methods
          ?.allowance(account, permit2Address)
          .call();

        return BN(allowance?.toString() || "0").gte(fromAmount);
      } catch (error) {
        return false;
      }
    },
    [account, address, getContract]
  );
};

export const useAllowance = ({fromToken, fromAmount}:{
  fromToken?: Token;
  fromAmount?: string;
}) => {
  const wToken = useChainConfig()?.wToken;


  const isApproved = useApproved(
    isNativeAddress(fromToken?.address || "")
      ? wToken?.address
      : fromToken?.address
  );
  const { account, chainId } = useMainContext();
  return useQuery({
    queryKey: [
      QUERY_KEYS.APPROVE,
      account,
      chainId,
      fromToken?.address,
      fromAmount,
    ],
    queryFn: async () => isApproved(fromAmount!),
    enabled:
      !!fromToken &&
      !!account &&
      !!chainId &&
      !!fromAmount &&
      BN(fromAmount).gt(0),
    staleTime: Infinity,
  });
};
