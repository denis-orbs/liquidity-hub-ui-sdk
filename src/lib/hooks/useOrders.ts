import { useCallback, useMemo } from "react";
import { useOrdersStore } from "../store/main";
import { Order, Quote, Token } from "../type";
import { getChainConfig } from "../util";

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

  return useCallback(
    ({
      quote,
      txHash,
      fromToken,
      toToken,
      chainId,
    }: {
      quote: Quote;
      txHash: string;
      fromToken: Token;
      toToken: Token;
      chainId: number;
    }) => {
      if (!fromToken || !toToken) return;
      const config = getChainConfig(chainId);
      addOrder({
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: quote.inAmount,
        toAmount: quote.outAmount,
        txHash,
        explorerLink: `${config?.explorer}/tx/${txHash}`,
      });
    },
    [addOrder]
  );
};

export const useOrders = (account?: string, chainId?: number) => {
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
