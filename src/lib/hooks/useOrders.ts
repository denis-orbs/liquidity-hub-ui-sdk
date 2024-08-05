import { useCallback, useMemo } from "react";
import { useMainContext } from "../context/MainContext";
import { useOrdersStore } from "../store/main";
import { Order, Quote, Token } from "../type";
import { useChainConfig } from "./useChainConfig";

export type AddOrderArgs = {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  txHash: string;
  explorerLink: string;
};

export const useAddOrderCallback = () => {
  const addOrder = useOrders().addOrder;
  const { state } = useMainContext();
  const { fromAmount, fromToken, toToken } = state;
  const chainConfig = useChainConfig();

  return useCallback(
    (quote: Quote, txHash: string) => {
      if (!fromToken || !toToken || !fromAmount) return;
      addOrder({
        fromToken: fromToken,
        toToken: toToken,
        fromAmount,
        toAmount: quote.outAmount,
        txHash,
        explorerLink: `${chainConfig?.explorer}/tx/${txHash}`,
      });
    },
    [addOrder, fromToken, toToken, fromAmount, chainConfig?.explorer]
  );
};

export const useOrders = () => {
  const { account, chainId } = useMainContext();
  const store = useOrdersStore();
  const orders = account && chainId ? store.orders?.[account]?.[chainId] : [];

  const addOrder = useCallback(
    (args: AddOrderArgs) => {
      if (!account || !chainId) return;

      const _order: Order = {
        ...args,
        id: crypto.randomUUID(),
        date: new Date().getTime(),
      };
      store.addOrder(account, chainId, _order);
    },
    [store.addOrder, account, chainId, orders]
  );

  return {
    addOrder,
    orders: useMemo(() => orders?.sort((a, b) => b.date - a.date), [orders]),
  };
};
