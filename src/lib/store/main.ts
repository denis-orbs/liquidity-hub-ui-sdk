import { LH_CONTROL, Order, Orders, Quote, SwapStatus, SwapStep } from "../type";
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

export const useOrdersStore = create(
  persist<OrdersStore>(
    (set) => ({
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
    }),
    {
      name: "liquidity-hub-orders",
    }
  )
);

interface MainStore {
  sessionId?: string;
  chainId?: number;
  updateState: (args: Partial<MainStore>) => void;
}

export const useMainStore = create<MainStore>((set) => ({
  updateState: (args) => set({...args}),
}));


interface SwapStore {
  swapStep?: SwapStep;
  swapStatus?: SwapStatus;
  acceptedQuote?: Quote;
  isWrappedNativeToken?: boolean;
  txHash?: string;
  updateState: (args: Partial<SwapStore>) => void;

}

export const useSwapStore = create<SwapStore>((set) => ({
  updateState: (args) => set({...args}),
}));
