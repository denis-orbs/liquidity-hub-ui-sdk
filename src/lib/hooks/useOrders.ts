import { useCallback, useMemo } from "react";
import { useMainContext } from "../provider";
import { useOrdersStore } from "../store/main";
import { AddOrderArgs, Order } from "../type";
import BN from "bignumber.js";

export const useOrders = () => {
  const { account, chainId } = useMainContext();
  const store = useOrdersStore();
  const orders = account && chainId ? store.orders?.[account]?.[chainId] : []

  const addOrder = useCallback(
    (args: AddOrderArgs) => {
      if (!account || !chainId) return;
      const { fromUsd, toUsd, fromAmount, toAmount } = args;

      const _order: Order = {
        ...args,
        id: crypto.randomUUID(),
        date: new Date().getTime(),
        fromUsd: new BN(fromAmount)
          .multipliedBy(new BN(fromUsd || "0"))
          .toString(),
        toUsd: new BN(toAmount).multipliedBy(new BN(toUsd || "0")).toString(),
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
