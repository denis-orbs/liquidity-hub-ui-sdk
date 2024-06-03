import { useGlobalStore, useSwapState } from "../../store/main";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../../analytics";
import { useAllowance } from "./useAllowance";
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
import { useQuote } from "./useQuote";
import { STEPS } from "../../type";
import { useMainContext } from "../../provider";
import { sign } from "../../swap/sign";
import { approve } from "../../swap/approve";
import { wrap } from "../../swap/wrap";
import { useEstimateGasPrice } from "../useEstimateGasPrice";
import { swapX } from "../../swap/swapX";
import { useApiUrl } from "./useApiUrl";

export const useSubmitSwap = () => {
  const { onCloseSwap, fromAmount, fromToken, toToken, failures, updateState } =
    useSwapState(
      useShallow((store) => ({
        onCloseSwap: store.onCloseSwap,
        fromAmount: store.fromAmount,
        fromToken: store.fromToken,
        toToken: store.toToken,
        updateState: store.updateState,
        failures: store.failures,
      }))
    );

  const { data: quote } = useQuote();
  const { web3, provider, account, chainId } = useMainContext();
  const chainConfig = useChainConfig();
  const wTokenAddress = chainConfig?.wToken?.address;
  const explorerUrl = chainConfig?.explorerUrl;
  const addOrder = useOrders().addOrder;
  const { data: approved, refetch: refetchAllowance } = useAllowance();
  const gas = useEstimateGasPrice();
  const apiUrl = useApiUrl();
  return useCallback(
    async (props?: { hasFallback?: boolean, onWrapSuccess?: () => void }) => {
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
        updateState({ swapStatus: "loading" });
        if (isNativeIn) {
          updateState({ currentStep: STEPS.WRAP });
          await wrap(account, web3, chainId, inTokenAddress, fromAmount, gas);
          inTokenAddress = wTokenAddress;
          props?.onWrapSuccess?.();
          updateState({ isWrapped: true });
        }
        if (!approved) {
          Logger("Approval required");
          updateState({ currentStep: STEPS.APPROVE });
          await approve(account, web3, chainId, inTokenAddress);
        } else {
          swapAnalytics.onApprovedBeforeTheTrade();
        }
        Logger("Signing...");
        updateState({ currentStep: STEPS.SEND_TX });
        const signature = await sign(account, web3, provider, quote.permitData);
        updateState({ isSigned: true });
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
        updateState({
          txHash,
        });
        const txDetails = await waitForTxReceipt(web3, txHash);

        if (!txDetails?.mined) {
          throw new Error(txDetails?.revertMessage);
        }

        swapAnalytics.onClobOnChainSwapSuccess();
        updateState({
          swapStatus: "success",
          failures: 0,
        });
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
          updateState({
            swapStatus: undefined,
          });
          return;
        }

        swapAnalytics.onClobFailure();
        updateState({
          failures: (failures || 0) + 1,
        });
        if (props?.hasFallback) {
          // fallback to Dex
          onCloseSwap();
        }
        Logger(`Swap error: ${error.message}`);
        updateState({
          swapError: error.message,
          swapStatus: "failed",
        });
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
      onCloseSwap,
      addOrder,
      explorerUrl,
      updateState,
      failures,
      web3,
      provider,
      account,
      chainId,
      chainConfig,
      gas,
      apiUrl,
      refetchAllowance,
    ]
  );
};
