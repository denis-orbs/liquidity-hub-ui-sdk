import { useGlobalStore } from "../../store/main";
import { useCallback, useState } from "react";
import { swapAnalytics } from "../../analytics";
import { useApprove } from "./useApprove";
import { useChainConfig } from "../useChainConfig";
import { useSwapX } from "./useSwapX";
import { useSign } from "./useSign";
import { useWrap } from "./useWrap";
import { amountUi, isNativeAddress, Logger } from "../../util";
import BN from "bignumber.js";
import { zeroAddress } from "../../config/consts";
import {
  ActionStatus,
  AddOrderArgs,
  QuoteResponse,
  STEPS,
  Token,
} from "../../type";

export const useSubmitSwap = ({
  onWrapSuccess,
  fromAmount,
  fromToken,
  toToken,
  quote,
  approved,
  addOrder,
  onError,
  onSuccess: _onSuccess,
  updateSwapStatus
}: {
  onWrapSuccess?: () => void;
  fromAmount?: string;
  fromToken?: Token;
  toToken?: Token;
  quote?: QuoteResponse;
  approved?: boolean;
  addOrder: (args: AddOrderArgs) => void;
  onError: () => void;
  onSuccess: () => void;
  updateSwapStatus: (status: ActionStatus) => void;
}) => {
  const [currentStep, setSurrentStep] = useState<STEPS | undefined>(undefined);
  const [isSigned, setIsSigned] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const approve = useApprove();
  const wrap = useWrap(fromToken);
  const sign = useSign();
  const requestSwap = useSwapX();
  const chainConfig = useChainConfig();
  const wTokenAddress = chainConfig?.wToken?.address;
  const explorerUrl = chainConfig?.explorerUrl;
  const setSessionId = useGlobalStore().setSessionId;

  const reset = useCallback(() => {
    updateSwapStatus(undefined);
    setSurrentStep(undefined);
    setIsSigned(false);
    setError(undefined);
  }, []);

  const swapCallback = useCallback(
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

        updateSwapStatus("loading");
        const isNativeIn = isNativeAddress(fromToken.address);
        const isNativeOut = isNativeAddress(toToken.address);
        let inTokenAddress = isNativeIn ? zeroAddress : fromToken.address;
        const outTokenAddress = isNativeOut ? zeroAddress : toToken.address;
        Logger({ inTokenAddress, outTokenAddress });
        Logger({ quote });
        if (isNativeIn) {
          setSurrentStep(STEPS.WRAP);
          await wrap(fromAmount);
          inTokenAddress = wTokenAddress;
          isWrapped = true;
        }
        if (!approved) {
          setSurrentStep(STEPS.APPROVE);
          await approve(inTokenAddress, fromAmount);
        } else {
          swapAnalytics.onApprovedBeforeTheTrade();
        }
        setSurrentStep(STEPS.SEND_TX);
        const signature = await sign(quote.permitData);
        setIsSigned(true);
        const txHash = await requestSwap({
          signature,
          inTokenAddress,
          outTokenAddress,
          fromAmount,
          quote,
        });
        setTxHash(txHash);
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
        updateSwapStatus("success");
        _onSuccess();
        return txHash;
      } catch (error: any) {
        let message = "";

        swapAnalytics.onClobFailure();
        if (props?.hasFallback) {

        }
        Logger(`Swap error: ${error.message}`);
        if (isWrapped) {
          message = `${chainConfig?.native.symbol} has been wrapped to ${chainConfig?.wToken?.symbol}`;
        }

        setError(message);
        updateSwapStatus("failed");
        onError();
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
      approved,
      addOrder,
      explorerUrl,
      setSessionId,
      onWrapSuccess,
      chainConfig,
      onError,
      _onSuccess,
      updateSwapStatus
    ]
  );

  return {
    swapCallback,
    currentStep,
    isSigned,
    swapError: error,
    reset,
    txHash
  };
};
