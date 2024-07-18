import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import Web3 from "web3";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { useTokenListBalances } from "./useTokenListBalances";
import { useTokensList } from "./useTokenList";
import { QUERY_KEYS } from "../../config/consts";
import { getBalances } from "../../multicall";
import { useDexState } from "../../store/dex";
import { Token, Balances } from "../../type";
import { delay } from "../../util";
import { useMainContext } from "../../context/MainContext";
export function useRefreshBalancesAfterTx() {
  const { data: balances } = useTokenListBalances();
  const {account, web3, chainId} = useMainContext();
  const queryClient = useQueryClient(); 
  const list = useTokensList().data;
  const { fromToken, toToken, updateStore } = useDexState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      updateStore: s.updateStore,
    }))
  );

  return useCallback(async () => {
    if (!account || !web3 || !fromToken || !toToken || !balances) return;
    updateStore({ fetchingBalancesAfterTx: true });
    try {
    const updatedBalances =  await loopBalances(web3, account, fromToken, toToken, balances);
    queryClient.setQueryData([QUERY_KEYS.BALANCES, account, chainId, _.size(list), web3?.version], (prev: any) => {
      return {
        ...prev,
        ...updatedBalances
      }
    });
    } catch (error) {
      console.error("useRefreshBalancesAfterTx", error);
    } finally {
      updateStore({ fetchingBalancesAfterTx: false });
    }
  }, [account, web3, balances, fromToken, toToken, queryClient, updateStore]);
}

const loopBalances = async (
  web3: Web3,
  account: string,
  fromToken: Token,
  toToken: Token,
  currentBalances: Balances
) => {
  const newBalances = await getBalances([fromToken, toToken], web3, account);
  if (
    currentBalances[fromToken.address] !== newBalances[fromToken.address] &&
    currentBalances[toToken.address] !== newBalances[toToken.address]
  ) {
    return {
      [fromToken.address]: newBalances[fromToken.address],
      [toToken.address]: newBalances[toToken.address],
    };
  }
  await delay(3_000);
  loopBalances(web3, account, fromToken, toToken, currentBalances);
};
