import { useCallback, useEffect, useMemo } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useSwapState } from "../store/main";
import { UseLiquidityHubArgs } from "../type";
import { amountBN } from "../util";
import { useTradeOwner } from "./useTradeOwner";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import useAnalytics from "./useAnalytics";
import { useDebounce } from "./useDebounce";

const useFromAmountWei = (args: UseLiquidityHubArgs) => {
  return useMemo(() => {
    if ((!args.fromAmount && !args.fromAmountUI) || !args.fromToken) {
      return "0";
    }
    return args.fromAmount
      ? args.fromAmount
      : amountBN(args.fromToken.decimals, args.fromAmountUI || "0").toString();
  }, [args.fromAmount, args.fromAmountUI, args.fromToken]);
};

const useDexMinAmountOutWei = (args: UseLiquidityHubArgs) => {
  return useMemo(() => {
    if ((!args.minAmountOut && !args.minAmountOutUI) || !args.toToken) {
      return undefined;
    }
    const value = args.minAmountOut
      ? args.minAmountOut
      : amountBN(args.toToken.decimals, args.minAmountOutUI || "0").toString();
    return BN(value).decimalPlaces(0).toString();
  }, [args.minAmountOutUI, args.minAmountOutUI, args.toToken]);
};

const useDexExpectedAmountOutWei = (args: UseLiquidityHubArgs) => {
  return useMemo(() => {
    if (
      (!args.expectedAmountOut && !args.expectedAmountOutUI) ||
      !args.toToken
    ) {
      return undefined;
    }
    const value = args.expectedAmountOut
      ? args.expectedAmountOut
      : amountBN(
          args.toToken.decimals,
          args.expectedAmountOutUI || "0"
        ).toString();
    return BN(value).decimalPlaces(0).toString();
  }, [args.expectedAmountOutUI, args.expectedAmountOutUI, args.toToken]);
};

export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { swapStatus, swapError, updateState } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
      swapError: store.swapError,
      updateState: store.updateState,
    }))
  );
  const _fromAmount = useFromAmountWei(args);
  const fromAmount = useDebounce(_fromAmount, 200);
  const dexMinAmountOut = useDexMinAmountOutWei(args);
  const dexExpectedAmountOut = useDexExpectedAmountOutWei(args);
    
  useEffect(() => {
    updateState({
      fromAmount,
      dexMinAmountOut,
      dexExpectedAmountOut,
      fromTokenUsd: args.fromTokenUsd,
      toTokenUsd: args.toTokenUsd,
      fromToken: args.fromToken,
      toToken: args.toToken,
    });
  }, [
    updateState,
    fromAmount,
    dexMinAmountOut,
    dexExpectedAmountOut,
    args.fromTokenUsd,
    args.toTokenUsd,
    args.fromToken,
    args.toToken,
  ]);

  const quote = useQuote();
  const isApproved = useAllowance().data;
  const tradeOwner = useTradeOwner(quote.data?.outAmount, dexMinAmountOut);
  const analyticsInit = useAnalytics().initTrade;

  const confirmSwap = useCallback(() => {
    updateState({ showConfirmation: true });
  }, [updateState]);

  return {
    quote,
    confirmSwap,
    swapLoading: swapStatus === "loading",
    swapError,
    tradeOwner,
    analyticsInit,
    isApproved,
  };
};
