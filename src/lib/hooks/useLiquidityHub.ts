import { useCallback, useMemo } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useSwapState } from "../store/main";
import { UseLiquidityHubArgs } from "../type";
import { amountBN } from "../util";
import { useTradeOwner } from "./useTradeOwner";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { EMPTY_QUOTE_RESPONSE } from "../config/consts";
import useAnalytics from "./useAnalytics";

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
      : amountBN(
          args.toToken.decimals,
          args.minAmountOutUI || "0"
        ).toString();
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

const useConfirmSwap = (
  args: UseLiquidityHubArgs,
  dexMinAmountOut?: string,
  dexExpectedAmountOut?: string
) => {
  const fromAmount = useFromAmountWei(args);
  const updateState = useSwapState(useShallow((s) => s.updateState));

  return useCallback(() => {
    if (!args.fromToken || !args.toToken || !fromAmount) {
      console.error("Missing args ");
      return;
    }

    updateState({
      fromToken: args.fromToken,
      toToken: args.toToken,
      fromAmount,
      showConfirmation: true,
      dexMinAmountOut,
      fromTokenUsd: args?.fromTokenUsd,
      toTokenUsd: args?.toTokenUsd,
      dexExpectedAmountOut,
    });
  }, [
    args.fromToken,
    args.toToken,
    fromAmount,
    updateState,
    dexMinAmountOut,
    args?.fromTokenUsd,
    args?.toTokenUsd,
    dexExpectedAmountOut,
  ]);
};


const useUpdateUsdAmounts = (args: UseLiquidityHubArgs) => {
  const updateState = useSwapState(useShallow((s) => s.updateState));

  return useCallback(
    () => {
      updateState({
        fromTokenUsd: args.fromTokenUsd,
        toTokenUsd: args.toTokenUsd,
      });
    },
    [updateState, args.fromTokenUsd, args.toTokenUsd]
  );
}

export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { toToken, fromToken } = args;
  useUpdateUsdAmounts(args);
  const { swapStatus, swapError } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
      swapError: store.swapError,
    }))
  );

  const fromAmount = useFromAmountWei(args);

  const dexMinAmountOut = useDexMinAmountOutWei(args);
  const dexExpectedAmountOut = useDexExpectedAmountOutWei(args);

  const quoteQuery = useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexMinAmountOut,
  });

  // prefetching allowance
  useAllowance(fromToken, fromAmount);

  const tradeOwner = useTradeOwner(quoteQuery.data?.outAmount, dexMinAmountOut);
  const analyticsInit = useAnalytics();

  const analyticsInitTrade = useCallback(() => {
    analyticsInit.initTrade({
      fromToken,
      toToken,
      fromAmount,
      dexMinAmountOut,
      dexExpectedAmountOut,
      quoteAmountOut: quoteQuery.data?.outAmount,
      toTokenUsd: args.toTokenUsd,
      fromTokenUsd: args.fromTokenUsd,
    });
  }, [
    fromToken,
    toToken,
    fromAmount,
    quoteQuery.data?.outAmount,
    dexMinAmountOut,
    dexExpectedAmountOut,
    analyticsInit,
    args.toTokenUsd,
    args.fromTokenUsd,
  ]);

  const showSwapConfirmation = useConfirmSwap(
    args,
    dexMinAmountOut,
    dexExpectedAmountOut
  );

  const noQuoteAmountOut = useMemo(() => {
    if (quoteQuery.isLoading) return false;
    if (quoteQuery.data?.outAmount && new BN(quoteQuery.data?.outAmount).gt(0))
      return false;
    return true;
  }, [quoteQuery.data?.outAmount, quoteQuery.isLoading]);

  return {
    quote: noQuoteAmountOut ? EMPTY_QUOTE_RESPONSE : quoteQuery.data,
    quoteLoading: quoteQuery.isLoading,
    quoteError: quoteQuery.error,
    confirmSwap: showSwapConfirmation,
    swapLoading: swapStatus === "loading",
    swapError,
    tradeOwner,
    analyticsInitTrade,
  };
};
