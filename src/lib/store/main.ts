import {
  ActionStatus,
  LH_CONTROL,
  Order,
  Orders,
  QuoteResponse,
  STEPS,
  Token,
} from "../type";
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
  dexMinAmountOut?: string;
  disableLh?: boolean;
  quoteOutdated?: boolean;
  isSigned?: boolean;
  disabledByDex?: boolean;
  quoteEnabled?: boolean;
  swapConfirmationOutAmount?: string;
  swapConfirmationOutAmountUsd?: string;
  slippage?: number;
  outTokenUsd?: string | number;
  inTokenUsd?: string | number;
}

interface SwapState extends SwapStateValues {
  updateState: (state: Partial<SwapState>) => void;
  onSwapError: (error: string) => void;
  onSwapSuccess: (quote?: QuoteResponse) => void;
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
  dexMinAmountOut: undefined,
  disableLh: false,
  quoteOutdated: undefined,
  isSigned: false,
  disabledByDex: false,
  quoteEnabled: false,
  slippage: undefined,
};

export const useSwapState = create<SwapState>((set, get) => ({
  ...initialSwapState,
  onSwapStart: () => set({ swapStatus: "loading" }),
  updateState: (state) => {    
    set({ ...state })
  },

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

    if (get().swapStatus === "failed") {
      setTimeout(() => {
        set({
          swapStatus: undefined,
          swapError: undefined,
          currentStep: undefined,
        });
      }, 3_00);
    }

    if (get().swapStatus === "success") {
      setTimeout(() => {
        get().reset();
      }, 3_00);
    }
  },
  reset: () => set({ ...initialSwapState }),
}));

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
