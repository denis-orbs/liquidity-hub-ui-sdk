import { useGlobalStore, useSwapState } from "../../store/main";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../../analytics";
import { useAllowance } from "./useAllowance";
import { useApprove } from "./useApprove";
import { useChainConfig } from "../useChainConfig";
import { useSwapX } from "./useSwapX";
import { useSign } from "./useSign";
import { useWrap } from "./useWrap";
import { amountUi, isNativeAddress, Logger } from "../../util";
import BN from "bignumber.js";
import { zeroAddress } from "../../config/consts";
import { useOrders } from "../useOrders";
import { useQuote } from "./useQuote";

export const useSubmitSwap = (onWrapSuccess?: () => void) => {
  const {
    onSwapSuccess,
    onSwapError,
    onSwapStart,
    onCloseSwap,
    fromAmount,
    fromToken,
    toToken,
  } = useSwapState(
    useShallow((store) => ({
      onSwapSuccess: store.onSwapSuccess,
      onSwapError: store.onSwapError,
      onSwapStart: store.onSwapStart,
      onCloseSwap: store.onCloseSwap,
      fromAmount: store.fromAmount,
      fromToken: store.fromToken,
      toToken: store.toToken,
    }))
  );

  const { data: quote } = useQuote();
  const approve = useApprove();
  const wrap = useWrap(fromToken);
  const sign = useSign();
  const requestSwap = useSwapX();
  const chainConfig = useChainConfig();
  const wTokenAddress = chainConfig?.wToken?.address;
  const explorerUrl = chainConfig?.explorerUrl;
  const addOrder = useOrders().addOrder;
  const setSessionId = useGlobalStore().setSessionId;

  const { data: approved } = useAllowance();

  return useCallback(
    async (props?: {
      hasFallback?: boolean;
      onSuccess?: () => Promise<void>;
    }) => {
      let isWrapped = false;
      try {
        if (!wTokenAddress) {
          throw new Error("Missing weth address");
        }

        if (!quote) {
          throw new Error("Missing quote");
        }

        if (!fromToken || !toToken) {
          throw new Error("Missing from or to token");
        }
        if (!fromAmount) {
          throw new Error("Missing from amount");
        }

        onSwapStart();
        const isNativeIn = isNativeAddress(fromToken.address);
        const isNativeOut = isNativeAddress(toToken.address);

        let inTokenAddress = isNativeIn ? zeroAddress : fromToken.address;
        const outTokenAddress = isNativeOut ? zeroAddress : toToken.address;
        Logger({ inTokenAddress, outTokenAddress });
        Logger({ quote });
        if (isNativeIn) {
          await wrap(fromAmount);
          inTokenAddress = wTokenAddress;
          isWrapped = true;
        }
        if (!approved) {
          Logger("Approval required");
          await approve(inTokenAddress, fromAmount);
        } else {
          swapAnalytics.onApprovedBeforeTheTrade();
        }
        Logger("Signing...");
        const signature = await sign(quote.permitData);
        Logger(signature);
        const txHash = await requestSwap({
          signature,
          inTokenAddress,
          outTokenAddress,
          fromAmount,
          quote,
        });
        Logger(txHash);
        onSwapSuccess(quote);
        addOrder({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: amountUi(fromToken.decimals, new BN(fromAmount)),
          toAmount: quote.ui.outAmount || "",
          txHash,
          explorerLink: `${explorerUrl}/tx/${txHash}`,
        });
        setSessionId(undefined);
        await props?.onSuccess?.();
        Logger("Swap success");
        return txHash;
      } catch (error: any) {
        let message = "";

        swapAnalytics.onClobFailure();
        if (props?.hasFallback) {
          onCloseSwap();
        }
        Logger(`Swap error: ${error.message}`);
        if (isWrapped) {
          message = `${chainConfig?.native.symbol} has been wrapped to ${chainConfig?.wToken?.symbol}`;
        }
        onSwapError(message);
        throw error;
      } finally {
        if (isWrapped) {
          onWrapSuccess?.();
        }
        swapAnalytics.clearState();
      }
    },
    [
      approve,
      wrap,
      sign,
      requestSwap,
      wTokenAddress,
      fromAmount,
      fromToken,
      toToken,
      quote,
      onSwapSuccess,
      onSwapError,
      approved,
      onSwapStart,
      onCloseSwap,
      addOrder,
      explorerUrl,
    ]
  );
};
