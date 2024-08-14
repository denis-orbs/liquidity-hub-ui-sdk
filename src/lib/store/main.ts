import {
  LH_CONTROL,
  Order,
  Orders,
} from "../type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LHControlStore {
  debug: boolean;
  setDebug: (value: boolean) => void;
  lhControl?: LH_CONTROL;
  setLHControl: (lhControl?: LH_CONTROL) => void;
  orders: Orders;
  setOrders: (orders: Orders) => void;
  setForce: () => void;
}
export const useLiquidityHubPersistedStore = create(
  persist<LHControlStore>(
    (set) => ({
      debug: false,
      setDebug: (value) => set({ debug: value }),
      lhControl: undefined,
      setLHControl: (lhControl) => set({ lhControl }),
      setForce: () => set({ lhControl: LH_CONTROL.FORCE }),
      orders: {},
      setOrders: (orders) => set({ orders }),
    }),
    {
      name: "liquidity-hub-control",
    }
  )
);

interface OrdersStore {
  orders: Orders;
  addOrder: (address: string, chain: number, order: Order) => void;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: useLiquidityHubPersistedStore.getState().orders,
  addOrder: (address, chain, order) => {
    set((s) => {
      const orders = s.orders;
      if (!orders[address]) {
        orders[address] = {};
      }
      if (!orders[address][chain]) {
        orders[address][chain] = [];
      }
      orders[address][chain].unshift(order);
      useLiquidityHubPersistedStore.getState().setOrders(orders);
      return { orders };
    });
  },
}));
