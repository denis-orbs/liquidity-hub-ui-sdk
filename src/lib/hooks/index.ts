import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";

export * from "./useIsInvalidChain";
export * from "./useSwitchNetwork";
export * from "./useChainConfig";
export * from "./useFormatNumber";
export * from "./useContractCallback";
export * from './useOrders'
export * from "./useUnwrap";
export * from './useSettings'
export * from './swap'
export * from './useAmountBN'
export * from './useAmountUI'
export * from './useSwapDetails'
export * from './useIsDisabled'
export * from './useSlippage'
export const useOriginalQuote = () => useSwapState(useShallow(it => it.originalQuote))