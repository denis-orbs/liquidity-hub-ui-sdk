import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import Web3 from "web3";
import _ from "lodash";
import { useTokenListBalances } from "./useTokenListBalances";
import { useTokensList } from "./useTokenList";
import { useMainContext } from "../../lib/context/MainContext";
import { useWidgetContext } from "../context";
import { delay, Token } from "../../lib";

import { Balances } from "../types";
import { getBalances } from "../getBalances";
export function useRefreshBalancesAfterTx() {
  const { data: balances } = useTokenListBalances();
  const { account, web3, chainId } = useMainContext();
  const queryClient = useQueryClient();
  const list = useTokensList().data;
  const {
    updateState,
    state: { fromToken, toToken },
  } = useWidgetContext();

  return useCallback(async () => {
    if (!account || !web3 || !fromToken || !toToken || !balances) return;
    updateState({ fetchingBalancesAfterTx: true });
    try {
      const updatedBalances = await loopBalances(
        web3,
        account,
        fromToken,
        toToken,
        balances
      );
      queryClient.setQueryData(
        ["get-balances", account, chainId, _.size(list), web3?.version],
        (prev: any) => {
          return {
            ...prev,
            ...updatedBalances,
          };
        }
      );
    } catch (error) {
      console.error("useRefreshBalancesAfterTx", error);
    } finally {
      updateState({ fetchingBalancesAfterTx: false });
    }
  }, [account, web3, balances, fromToken, toToken, queryClient, updateState]);
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
