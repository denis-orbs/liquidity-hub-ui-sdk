import { useCallback, useMemo } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { swapAnalytics } from "../analytics";
import { useSwapState } from "../store/main";
import { ShowConfirmationProps, UseLiquidityHubArgs } from "../type";
import { amountBN, deductSlippage } from "../util";
import { useTradeOwner } from "./useTradeOwner";
import { useMainContext } from "../provider";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";

const useSendAnalyticsEvents = (
  args: UseLiquidityHubArgs,
  quoteAmountOut?: string
) => {
  const fromAmount = useFromAmountWei(args);
  const dexAmountOut = useDexAmountOutWei(args);
  const slippage = useMainContext().slippage;
  return useCallback(
    (fromTokenUsd: string | number, toTokenUsd: string | number) => {
      swapAnalytics.onInitSwap({
        fromTokenUsd,
        fromToken: args.fromToken,
        toToken: args.toToken,
        dexAmountOut,
        dstTokenUsdValue: toTokenUsd,
        srcAmount: fromAmount,
        slippage,
        tradeType: "BEST_TRADE",
        tradeOutAmount: dexAmountOut,
        quoteAmountOut: quoteAmountOut || "",
      });
    },
    [
      args.fromToken,
      args.toToken,
      dexAmountOut,
      fromAmount,
      slippage,
      quoteAmountOut,
    ]
  );
};

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

const useDexAmountOutWei = (args: UseLiquidityHubArgs) => {
  const slippage = useMainContext().slippage;
  return useMemo(() => {
    if ((!args.dexAmountOut && !args.dexAmountOutUI) || !args.toToken) {
      return "0";
    }
    const value = args.dexAmountOut
      ? args.dexAmountOut
      : amountBN(args.toToken.decimals, args.dexAmountOutUI || "0").toString();

    if (!args.ignoreSlippage) {
      return deductSlippage(value, slippage);
    }
    return value;
  }, [
    args.dexAmountOut,
    args.dexAmountOutUI,
    args.toToken,
    args.ignoreSlippage,
    slippage,
  ]);
};

const useConfirmSwap = (args: UseLiquidityHubArgs) => {
  const fromAmount = useFromAmountWei(args);
  const dexAmountOut = useDexAmountOutWei(args);
  const updateState = useSwapState(useShallow((s) => s.updateState));

  return useCallback(
    (props?: ShowConfirmationProps) => {
      if (!args.fromToken || !args.toToken || !fromAmount) {
        console.error("Missing args ");
        return;
      }
      updateState({
        fromToken: args.fromToken,
        toToken: args.toToken,
        fromAmount,
        showConfirmation: true,
        dexAmountOut,
        fromTokenUsd: props?.fromTokenUsd,
        toTokenUsd: props?.toTokenUsd,
      });
    },
    [args.fromToken, args.toToken, fromAmount, updateState, dexAmountOut]
  );
};

export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { toToken, fromToken } = args;

  const { swapStatus, swapError } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
      swapError: store.swapError,
    }))
  );

  const fromAmount = useFromAmountWei(args);

  const dexAmountOut = useDexAmountOutWei(args);

  const quoteQuery = useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexAmountOut,
  });

  // prefetching allowance
  useAllowance(fromToken, fromAmount);

  const tradeOwner = useTradeOwner(quoteQuery.data?.outAmount, dexAmountOut);
  const analyticsInit = useSendAnalyticsEvents(
    args,
    quoteQuery.data?.outAmount
  );
  const showSwapConfirmation = useConfirmSwap(args);

  const noQuoteAmountOut = useMemo(() => {
    if (quoteQuery.isLoading) return false;
    if (quoteQuery.data?.outAmount && new BN(quoteQuery.data?.outAmount).gt(0))
      return false;
    return true;
  }, [quoteQuery.data?.outAmount, quoteQuery.isLoading]);

  return {
    quote: quoteQuery.data,
    noQuoteAmountOut,
    quoteLoading: quoteQuery.isLoading,
    quoteError: quoteQuery.error,
    confirmSwap: showSwapConfirmation,
    swapLoading: swapStatus === "loading",
    swapError,
    tradeOwner,
    analytics: {
      initSwap: analyticsInit,
    },
  };
};
