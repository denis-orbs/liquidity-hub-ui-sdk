import { useMainContext } from "../provider";

export * from "./useIsInvalidChain";
export * from "./useSwitchNetwork";
export * from "./useLiquidityHub";
export * from "./useChainConfig";
export * from "./useFormatNumber";
export * from "./useContractCallback";
export * from "./useSwapConfirmation";
export * from "./useSwapButton";
export * from "./useSteps";
export * from './useEstimateGasPrice'
export * from './useOrders'
export * from "./useUnwrap";
export * from "./useSteps"
export * from "./useDebounedFromAmount"
export * from './useGasCost'
export * from './useRate'
export * from './usePriceImpact'

export const useWeb3 = () => {
  return useMainContext().web3;
};

export const useChainId = () => {
    return useMainContext().chainId;
}

export const useAccount = () => {
    return useMainContext().account;
}

export const useSupportedChains = () => {
    return useMainContext().supportedChains;
}

export const useSlippage= () => {
    return useMainContext().slippage;
}
