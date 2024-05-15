import { useCallback, useMemo } from "react";
import { useMainContext } from "../provider";
import { useOrdersStore } from "../store/main";
import { AddOrderArgs, Order } from "../type";

export const useOrders = ({inTokenUsdAmount, outTokenUsdAmount}: {
  inTokenUsdAmount?: string;
  outTokenUsdAmount?: string;
}) => {
  const { account, chainId } = useMainContext();
  const store = useOrdersStore();
  const orders = account && chainId ? store.orders?.[account]?.[chainId] : []


  const addOrder = useCallback(
    (args: AddOrderArgs) => {
      if (!account || !chainId) return;

      const _order: Order = {
        ...args,
        id: crypto.randomUUID(),
        date: new Date().getTime(),
        fromUsd: inTokenUsdAmount,
        toUsd: outTokenUsdAmount,
      };
      store.addOrder(account, chainId, _order);
    },
    [store.addOrder, account, chainId, orders, inTokenUsdAmount, outTokenUsdAmount]
  );

  return {
    addOrder,
    orders: useMemo(() => orders?.sort((a, b) => b.date - a.date), [orders]),
  };
};
