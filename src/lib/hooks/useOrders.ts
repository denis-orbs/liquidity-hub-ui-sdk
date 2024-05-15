import { useCallback, useMemo } from "react";
import { useMainContext } from "../provider";
import { useOrdersStore } from "../store/main";
import { AddOrderArgs, Order } from "../type";
import { useUsdAmounts } from "./useSwapDetails";

export const useOrders = () => {
  const { account, chainId } = useMainContext();
  const store = useOrdersStore();
  const orders = account && chainId ? store.orders?.[account]?.[chainId] : []
  const {inTokenUsdAmount, outTokenUsdAmount} = useUsdAmounts()


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
