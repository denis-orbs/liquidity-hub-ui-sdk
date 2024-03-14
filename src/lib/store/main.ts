import { ActionStatus, LH_CONTROL, Order, Orders, STEPS, Token } from "../type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SwapStateValues {
  currentStep?: STEPS;
  showConfirmation?: boolean;
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  failures?: number;
  txHash?: string;
  swapStatus: ActionStatus;
  swapError?: string;
  dexAmountOut?: string;
  disableLh?: boolean;
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
  quoteOutdated?: boolean;
}

interface SwapState extends SwapStateValues {
  updateState: (state: Partial<SwapState>) => void;
  onSwapError: (error: string) => void;
  onSwapSuccess: () => void;
  onSwapStart: () => void;
  onCloseSwap: () => void;
  reset: () => void;
}

const initialSwapState: SwapStateValues = {
  currentStep: undefined,
  fromToken: undefined,
  toToken: undefined,
  fromAmount: undefined,
  showConfirmation: false,
  failures: 0,
  txHash: undefined,
  swapStatus: undefined,
  swapError: undefined,
  dexAmountOut: undefined,
  disableLh: false,
  fromTokenUsd: undefined,
  toTokenUsd: undefined,
  quoteOutdated: undefined,
};

export const useSwapState = create<SwapState>((set, get) => ({
  ...initialSwapState,
  onSwapStart: () => set({ swapStatus: "loading" }),
  updateState: (state) => set({ ...state }),
  onSwapSuccess: () => {
    set({
      failures: 0,
      swapStatus: "success",
    });
  },
  onSwapError: (swapError) =>
    set((s) => {
      const failures = (s.failures || 0) + 1;
      return {
        failures,
        swapError,
        swapStatus: "failed",
      };
    }),
  onCloseSwap: () => {
    set({
      showConfirmation: false,
    });

    if (get().swapStatus !== "loading") {
      setTimeout(() => {
        set(initialSwapState);
      }, 200);
    }
  },
  reset: () => set({...initialSwapState}),
}));

interface LHControlStore {
  lhControl?: LH_CONTROL;
  setLHControl: (lhControl?: LH_CONTROL) => void;
  liquidityHubEnabled: boolean;
  updateLiquidityHubEnabled: () => void;
  orders: Orders;
 setOrders: (orders: Orders) => void;
  password?: string;
  setPassword: (password: string) => void;
}
export const useLiquidityHubPersistedStore = create(
  persist<LHControlStore>(
    (set, get) => ({
      password: undefined,
      setPassword: (password) => set({ password }),
      lhControl: undefined,
      setLHControl: (lhControl) => set({ lhControl }),
      liquidityHubEnabled: true,
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
      return {orders}
    });
  }
}));