import { useLiquidityHubPersistedStore } from "../store/main";
import { Order, UseAddOrderArgs } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import BN from "bignumber.js";

export const useAddOrder = () => {
  const addOrder = useLiquidityHubPersistedStore((s) => s.addOrder);
  const { account, chainId } = useMainContext();
  return useCallback(
    (args: UseAddOrderArgs) => {
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
      addOrder(account, chainId, _order);
    },
    [addOrder, account, chainId]
  );
};
