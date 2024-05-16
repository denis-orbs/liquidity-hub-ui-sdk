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
  liquidityHubEnabled: boolean;
  updateLiquidityHubEnabled: () => void;
  orders: Orders;
  setOrders: (orders: Orders) => void;
  password?: string;
  setPassword: (password: string) => void;
  setForce: () => void;
}
export const useLiquidityHubPersistedStore = create(
  persist<LHControlStore>(
    (set, get) => ({
      debug: false,
      setDebug: (value) => set({ debug: value }),
      password: undefined,
      setPassword: (password) => set({ password }),
      lhControl: undefined,
      setLHControl: (lhControl) => set({ lhControl }),
      liquidityHubEnabled: true,
      setForce: () => set({ lhControl: LH_CONTROL.FORCE }),
      updateLiquidityHubEnabled: () =>
        set({ liquidityHubEnabled: !get().liquidityHubEnabled }),
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

interface GlobalStore {
  sessionId?: string;
  setSessionId: (sessionId?: string) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  sessionId: undefined,
  setSessionId: (sessionId) => set({ sessionId }),
}));
