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
  const chainConfig = useChainConfig();

  return useCallback(
    ({quote, txHash, fromToken, toToken}:{quote: Quote, txHash: string, fromToken: Token, toToken: Token}) => {
      if (!fromToken || !toToken) return;
      addOrder({
        fromToken: fromToken,
        toToken: toToken,
        fromAmount:quote.inAmount,
        toAmount: quote.outAmount,
        txHash,
        explorerLink: `${chainConfig?.explorer}/tx/${txHash}`,
      });
    },
    [addOrder, chainConfig?.explorer]
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
