import { swapAnalytics } from "../../analytics";
import { useChainConfig } from "../useChainConfig";
import {
  counter,
  delay,
  isNativeAddress,
  isNativeBalanceError,
  isTxRejected,
  Logger,
} from "../../util";
import { maxUint256, permit2Address, zeroAddress } from "../../config/consts";
import { useAddOrderCallback } from "../useOrders";
import { PermitData, Quote, STEPS } from "../../type";
import { useSignEIP712 } from "../../swap/sign";
import { swapX } from "../../swap/swapX";
import { useApiUrl } from "./useApiUrl";
import { useMutation } from "@tanstack/react-query";
import { useAllowance, useEnsureAllowance } from "./useAllowance";
import _ from "lodash";
import { useMainContext } from "../../context/MainContext";
import { useAnalytics } from "../useAnalytics";
import { useCallback } from "react";
import { useContract, useWrappedContract } from "../useContractCallback";
import { useSendAndWaitForConfirmations } from "./useSendAndWaitForConfirmations";
import { useWaitForTxDetails } from "./useWaitForTxDetails";

const useApprovalFlow = () => {
  const { state, updateState } = useMainContext();
  const { fromToken } = state;
  const ensureAllowance = useEnsureAllowance();
  const contract = useContract(fromToken?.address);
  const sendAndWaitForConfirmations = useSendAndWaitForConfirmations();
  const refetchAllowance = useAllowance().refetch;
  const onError = useOnError();
  return useCallback(async () => {
    if (!contract) {
      throw new Error("Contract not found");
    }
    const hasAllowance = await ensureAllowance();
    if (hasAllowance) {
      swapAnalytics.onApprovedBeforeTheTrade();
      return;
    }
    Logger("Approval required");
    updateState({ currentStep: STEPS.APPROVE });
    const count = counter();
    swapAnalytics.onApprovalRequest();
    try {
      await sendAndWaitForConfirmations({
        tx: contract.methods.approve(permit2Address, maxUint256),
        onTxHash: (approveTxHash) => {
          updateState({ approveTxHash });
        },
      });
      refetchAllowance();
    } catch (error) {
      swapAnalytics.onApprovalFailed((error as any).message, count());
      onError(error);
      throw error;
    }
  }, [
    fromToken,
    updateState,
    ensureAllowance,
    contract,
    sendAndWaitForConfirmations,
    refetchAllowance,
    onError,
  ]);
};

const useWrapFlow = () => {
  const {
    updateState,
    state: { fromToken },
  } = useMainContext();
  const sendAndWaitForConfirmations = useSendAndWaitForConfirmations();
  const contract = useWrappedContract();
  const onError = useOnError();

  return useCallback(async () => {
    if (!fromToken) {
      throw new Error("No from token found");
    }
    if (!isNativeAddress(fromToken.address)) return;
    updateState({ currentStep: STEPS.WRAP });
    if (!contract) {
      throw new Error("Contract not found");
    }
    const count = counter();
    swapAnalytics.onWrapRequest();

    try {
      await sendAndWaitForConfirmations({
        tx: contract.methods.deposit(),
        onTxHash: (wrapTxHash) => {
          updateState({ wrapTxHash });
        },
      });

      swapAnalytics.onWrapSuccess(count());
      updateState({ isWrapped: true });
    } catch (error) {
      swapAnalytics.onWrapFailed((error as any).message, count());
      onError(error);
      throw error;
    }
  }, [fromToken, updateState, contract, sendAndWaitForConfirmations, onError]);
};

const useSignFlow = () => {
  const { updateState } = useMainContext();
  const signEIP712 = useSignEIP712();
  const onError = useOnError();

  return useCallback(
    async (permitData: PermitData) => {
      Logger("Signing...");
      updateState({ currentStep: STEPS.SEND_TX });
      const count = counter();
      try {
        swapAnalytics.onSignatureRequest();

        const signature = await signEIP712(permitData);
        if (!signature) {
          throw new Error("No signature");
        }
        swapAnalytics.onSignatureSuccess(signature, count());
        updateState({ signature });
        Logger(signature);
        return signature;
      } catch (error) {
        swapAnalytics.onSignatureFailed((error as any).message, count());
        onError(error);
        throw new Error((error as Error)?.message);
      }
    },
    [updateState, signEIP712, onError]
  );
};

const useSwapXFlow = () => {
  const { state, updateState, account, chainId } = useMainContext();
  const { fromToken, toToken, fromAmount, sessionId } = state;
  const chainConfig = useChainConfig();
  const apiUrl = useApiUrl();
  const onError = useOnError();
  const addOrder = useAddOrderCallback();
  const waitForDetails = useWaitForTxDetails();
  const waitForSwap = useWaitForSwap();

  const wTokenAddress = chainConfig?.wToken?.address;
  return useCallback(
    async (quote: Quote, signature: string) => {
      let inTokenAddress = isNativeAddress(fromToken?.address || "")
        ? wTokenAddress
        : fromToken?.address;
      const outTokenAddress = isNativeAddress(toToken?.address || "")
        ? zeroAddress
        : toToken?.address;

      if (
        !inTokenAddress ||
        !outTokenAddress ||
        !fromAmount ||
        !sessionId ||
        !account ||
        !chainId ||
        !apiUrl
      ) {
        throw new Error("Invalid state");
      }
      const count = counter();
      swapX({
        signature,
        inTokenAddress,
        outTokenAddress,
        fromAmount,
        quote,
        account,
        chainId,
        apiUrl,
      })
        .then()
        .catch((err) => {
          onError(err);
        });
      try {
        const txHash = await waitForSwap(sessionId);
        if (!txHash) {
          throw new Error("Swap failed");
        }
        Logger(txHash);
        updateState({ txHash });
        const txDetails = await waitForDetails(txHash);

        if (!txDetails?.mined) {
          throw new Error(txDetails?.revertMessage);
        }

        swapAnalytics.onClobOnChainSwapSuccess();
        updateState({
          swapStatus: "success",
          failures: 0,
          sessionId: undefined,
          receipt: txDetails.receipt,
        });
        addOrder(quote, txHash);
        Logger("Swap success");
        swapAnalytics.clearState();
        return {
          txHash,
          receipt: txDetails.receipt,
        };
      } catch (error) {
        swapAnalytics.onSwapFailed((error as any).message, count());
        onError(error);
        throw error;
      }
    },
    [
      sessionId,
      fromToken,
      toToken,
      fromAmount,
      account,
      chainId,
      apiUrl,
      onError,
      updateState,
      addOrder,
      waitForDetails,
      waitForSwap,
      wTokenAddress,
    ]
  );
};

export const useSwapFlows = () => {
  const approvalFlow = useApprovalFlow();
  const wrapFlow = useWrapFlow();
  const signFlow = useSignFlow();
  const swapXFlow = useSwapXFlow();
  return {
    wrapFlow,
    approvalFlow,
    signFlow,
    swapXFlow,
  };
};

export const useSubmitSwap = () => {
  const { updateState } = useMainContext();

  const analytics = useAnalytics();
  const approvalFlow = useApprovalFlow();
  const wrapFlow = useWrapFlow();
  const signFlow = useSignFlow();
  const swapXFlow = useSwapXFlow();
  return useMutation({
    mutationFn: async (quote?: Quote) => {
      if (!quote) throw new Error("Missing quote");

      analytics.initTrade();
      updateState({ swapStatus: "loading" });
      await wrapFlow();
      await approvalFlow();
      const signature = await signFlow(quote.permitData);
      return swapXFlow(quote, signature);
    },
  });
};

const useOnError = () => {
  const {
    updateState,
    state: { failures },
  } = useMainContext();

  return useCallback(
    (error: any) => {
      swapAnalytics.onClobFailure();
      // if user rejects the tx, we get back to confirmation step

      if (isTxRejected(error.message)) {
        updateState({ swapStatus: undefined, currentStep: undefined });
        throw error;
      }
      Logger(`Swap error: ${error.message}`);
      updateState({
        swapStatus: "failed",
        currentStep: undefined,
        failures: isNativeBalanceError(error.message) ? 0 : (failures || 0) + 1,
      });
      swapAnalytics.clearState();
    },
    [updateState, failures]
  );
};

function useWaitForSwap() {
  const { chainId, account: user } = useMainContext();
  const apiUrl = useApiUrl();
  return useCallback(
    async (sessionId: string) => {
      // wait for swap to be processed, check every 2 seconds, for 2 minutes
      for (let i = 0; i < 60; ++i) {
        await delay(2_000);
        try {
          const response = await fetch(
            `${apiUrl}/swap/status/${sessionId}?chainId=${chainId}`,
            {
              method: "POST",
              body: JSON.stringify({ user }),
            }
          );
          const result = await response.json();
          if (result.error) {
            throw new Error(result.error);
          }

          if (result.txHash) {
            return result.txHash as string;
          }
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    },
    [chainId, user, apiUrl]
  );
}
