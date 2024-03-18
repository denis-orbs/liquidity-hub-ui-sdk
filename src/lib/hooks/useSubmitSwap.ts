import { useGlobalStore, useSwapState } from "../store/main";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useAllowance } from "./useAllowance";
import { useApprove } from "./useApprove";
import { useChainConfig } from "./useChainConfig";
import { useSwapX } from "./useSwapX";
import { useSign } from "./useSign";
import { useWrap } from "./useWrap";
import { useQuotePayload } from "./useQuoteData";
import { amountUi, isNativeAddress } from "../util";
import BN from "bignumber.js";
import { zeroAddress } from "../config/consts";
import { useOrders } from "./useOrders";

export const useSubmitSwap = () => {
  const {
    onSwapSuccess,
    onSwapError,
    onSwapStart,
    onCloseSwap,
    fromAmount,
    fromToken,
    toToken,
    fromTokenUsd,
    toTokenUsd,
  } = useSwapState(
    useShallow((store) => ({
      onSwapSuccess: store.onSwapSuccess,
      onSwapError: store.onSwapError,
      onSwapStart: store.onSwapStart,
      onCloseSwap: store.onCloseSwap,
      fromAmount: store.fromAmount,
      fromToken: store.fromToken,
      toToken: store.toToken,
      fromTokenUsd: store.fromTokenUsd,
      toTokenUsd: store.toTokenUsd,
    }))
  );

  const { data: quote } = useQuotePayload();
  const approve = useApprove();
  const wrap = useWrap(fromToken);
  const sign = useSign();
  const requestSwap = useSwapX();
  const chainConfig = useChainConfig();
  const wTokenAddress = chainConfig?.wToken?.address;
  const explorerUrl = chainConfig?.explorerUrl;
  const addOrder = useOrders().addOrder;
  const setSessionId = useGlobalStore().setSessionId

  const { data: approved } = useAllowance(fromToken, fromAmount);

  return useCallback(
    async (hasFallback?: boolean) => {
      let wrapped = false;
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

        if (isNativeIn) {
          await wrap(fromAmount);
          inTokenAddress = wTokenAddress;
          wrapped = true;
        }
        if (!approved) {
          await approve(inTokenAddress, fromAmount);
        }
        swapAnalytics.onApprovedBeforeTheTrade(approved);
        const signature = await sign(quote.permitData);
        const txHash = await requestSwap({
          srcToken: inTokenAddress,
          destToken: outTokenAddress,
          srcAmount: fromAmount,
          signature,
          quote,
        });
        onSwapSuccess();
        addOrder({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: amountUi(fromToken.decimals, new BN(fromAmount)),
          toAmount: quote.outAmountUI,
          fromUsd: fromTokenUsd,
          toUsd: toTokenUsd,
          txHash,
          explorerLink: `${explorerUrl}/tx/${txHash}`,
        });
        setSessionId(undefined);
        return txHash;
      } catch (error: any) {
        onSwapError(error.message);
        swapAnalytics.onClobFailure();

        if (wrapped) {
          // handle error happened after wrap
        }
        if (hasFallback) {
          onCloseSwap();
        }
        throw error;
      } finally {
        
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
      fromTokenUsd,
      toTokenUsd,
    ]
  );
};
