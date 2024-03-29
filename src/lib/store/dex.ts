import { create } from "zustand";
import { Token } from "../type";

interface DexState {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  toAmount?: string;
  fetchingBalancesAfterTx?: boolean;

  updateStore: (value: Partial<DexState>) => void;
  onFromAmountChange: (value: string) => void;
  onFromTokenChange: (value: Token) => void;
  onToTokenChange: (value: Token) => void;
  onSwitchTokens: () => void;
  reset: () => void;
onReserAfterSwap: () => void;
}

const initialState: Partial<DexState> = {
  fromToken: undefined,
  toToken: undefined,
  fromAmount: undefined,
  fetchingBalancesAfterTx: false,
};

export const useDexState = create<DexState>((set) => ({
  ...initialState,
  updateStore: (value) => set({ ...value }),
  onFromAmountChange: (value) => set({ fromAmount: value }),
  onFromTokenChange: (value) => set({ fromToken: value }),
  onToTokenChange: (value) => set({ toToken: value }),
  onSwitchTokens: () =>
    set((state) => ({
      fromToken: state.toToken,
      toToken: state.fromToken,
    })),
  reset: () => set({ ...initialState }),
  onReserAfterSwap: () => set({ fromAmount: undefined }),
}));
