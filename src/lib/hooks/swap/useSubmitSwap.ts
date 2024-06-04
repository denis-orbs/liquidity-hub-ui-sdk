import { useGlobalStore } from "../../store/main";
import { useCallback, useState } from "react";
import { swapAnalytics } from "../../analytics";
import { useChainConfig } from "../useChainConfig";
import {
  amountUi,
  isNativeAddress,
  isTxRejected,
  Logger,
  waitForTxReceipt,
} from "../../util";
import BN from "bignumber.js";
import { zeroAddress } from "../../config/consts";
import { useOrders } from "../useOrders";
import { ActionStatus, QuoteResponse, STEPS, Token } from "../../type";
import { useMainContext } from "../../provider";
import { sign } from "../../swap/sign";
import { approve } from "../../swap/approve";
import { wrap } from "../../swap/wrap";
import { useEstimateGasPrice } from "../useEstimateGasPrice";
import { swapX } from "../../swap/swapX";
import { useApiUrl } from "./useApiUrl";

export const useSubmitSwap = ({
  fromAmount,
  fromToken,
  toToken,
  quote,
  updateSwapStatus,
  updateSwapStep,
  setSwapError,
  incrementFailues,
  resetFailures,
  refetchAllowance,
  approved
}: {
  fromAmount?: string;
  fromToken?: Token;
  toToken?: Token;
  quote?: QuoteResponse,
  updateSwapStatus: (status?: ActionStatus) => void;
  updateSwapStep: (step?: STEPS) => void;
  setSwapError: (error?: string) => void;
  incrementFailues: () => void;
  resetFailures: () => void;
  refetchAllowance: () => void;
  approved?: boolean;
}) => {
  const [txHash, setTxHash] = useState<string | undefined
  >(undefined)
  const [isWrapped, setIsWrapped] = useState(false)
  const [isSigned, setIsSigned] = useState(false)

  const { web3, provider, account, chainId } = useMainContext();
  const chainConfig = useChainConfig();
  const wTokenAddress = chainConfig?.wToken?.address;
  const explorerUrl = chainConfig?.explorerUrl;
  const addOrder = useOrders().addOrder;
  const gas = useEstimateGasPrice();
  const apiUrl = useApiUrl();
  const onSwap =  useCallback(
    async (props?: { hasFallback?: boolean; onWrapSuccess?: () => void }) => {
      try {
        if (!apiUrl) {
          throw new Error("API URL not found");
        }
        if (!chainId) {
          throw new Error("Chain ID not found");
        }
        if (!account) {
          throw new Error("No account found");
        }
        if (!web3) {
          throw new Error("Web3 not found");
        }
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

        const isNativeIn = isNativeAddress(fromToken.address);
        const isNativeOut = isNativeAddress(toToken.address);

        let inTokenAddress = isNativeIn ? zeroAddress : fromToken.address;
        const outTokenAddress = isNativeOut ? zeroAddress : toToken.address;
        Logger({ inTokenAddress, outTokenAddress });
        Logger({ quote });
        updateSwapStatus('loading');
        if (isNativeIn) {
          updateSwapStep( STEPS.WRAP );
          await wrap(account, web3, chainId, inTokenAddress, fromAmount, gas);
          inTokenAddress = wTokenAddress;
          props?.onWrapSuccess?.();
          setIsWrapped(true);
        }
        if (!approved) {
          Logger("Approval required");
          updateSwapStep( STEPS.APPROVE);
          await approve(account, web3, chainId, inTokenAddress);
        } else {
          swapAnalytics.onApprovedBeforeTheTrade();
        }
        Logger("Signing...");
        updateSwapStep( STEPS.SEND_TX );
        const signature = await sign(account, web3, provider, quote.permitData);
        setIsSigned(true);
        Logger(signature);
        const txHash = await swapX({
          signature,
          inTokenAddress,
          outTokenAddress,
          fromAmount,
          quote,
          account,
          chainId,
          apiUrl,
        });
        Logger(txHash);
        setTxHash(txHash);
        const txDetails = await waitForTxReceipt(web3, txHash);

        if (!txDetails?.mined) {
          throw new Error(txDetails?.revertMessage);
        }

        swapAnalytics.onClobOnChainSwapSuccess();
        updateSwapStatus('success');
        resetFailures();
        useGlobalStore.getState().setSessionId(undefined);

        addOrder({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: amountUi(fromToken.decimals, new BN(fromAmount)),
          toAmount: quote.ui.outAmount || "",
          txHash,
          explorerLink: `${explorerUrl}/tx/${txHash}`,
        });

        Logger("Swap success");
        swapAnalytics.clearState();
        return {
          txHash,
          receipt: txDetails.receipt,
        };
      } catch (error: any) {
        // if user rejects the tx, we get back to confirmation step
        if (isTxRejected((error as Error).message)) {
          updateSwapStatus(undefined);
          return;
        }

        swapAnalytics.onClobFailure();

        incrementFailues();
        if (props?.hasFallback) {
          // fallback to Dex
          // onCloseSwap();
        }
        Logger(`Swap error: ${error.message}`);
        updateSwapStatus('failed');
        setSwapError(error.message)
        swapAnalytics.clearState();
        refetchAllowance();
        throw error.message;
      }
    },
    [
      approve,
      wrap,
      sign,
      wTokenAddress,
      fromAmount,
      fromToken,
      toToken,
      quote,
      approved,
      addOrder,
      explorerUrl,
      web3,
      provider,
      account,
      chainId,
      chainConfig,
      gas,
      apiUrl,
      updateSwapStatus,
      updateSwapStep,
      setSwapError,
      incrementFailues,
      resetFailures,
      refetchAllowance,
      isWrapped,
      isSigned
    ]
  );

  return {
    onSwap,
    txHash,
    isWrapped,
    isSigned
  }
};
