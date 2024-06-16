import { swapAnalytics } from "../../analytics";
import { useChainConfig } from "../useChainConfig";
import {
  amountUi,
  delay,
  isNativeAddress,
  isTxRejected,
  Logger,
  waitForTxReceipt,
} from "../../util";
import BN from "bignumber.js";
import { zeroAddress } from "../../config/consts";
import { useOrders } from "../useOrders";
import { QuoteResponse, STEPS, Token, UseLiquidityHubState } from "../../type";
import { useMainContext } from "../../provider";
import { sign } from "../../swap/sign";
import { approve } from "../../swap/approve";
import { wrap } from "../../swap/wrap";
import { useEstimateGasPrice } from "../useEstimateGasPrice";
import { swapX } from "../../swap/swapX";
import { useApiUrl } from "./useApiUrl";
import { useMutation } from "@tanstack/react-query";
import { useAllowance } from "./useAllowance";
import _ from "lodash";

export const useSubmitSwap = ({
  fromAmount,
  fromToken,
  toToken,
  quote,
  updateState,
  sessionId,
  failures
}: {
  fromAmount?: string;
  fromToken?: Token;
  toToken?: Token;
  quote?: QuoteResponse;
  updateState: (value: Partial<UseLiquidityHubState>) => void;
  sessionId?: string;
  failures: number;
}) => {
  const { web3, provider, account, chainId } = useMainContext();
  const chainConfig = useChainConfig();
  const wTokenAddress = chainConfig?.wToken?.address;
  const explorerUrl = chainConfig?.explorer;
  const addOrder = useOrders().addOrder;
  const gas = useEstimateGasPrice();
  const apiUrl = useApiUrl();

  const { data: hasAllowance, refetch: refetchAllowance } = useAllowance(
    fromToken?.address,
    fromAmount
  );

  return useMutation({
    mutationFn: async () => {
      if (!sessionId) {
        throw new Error("No session ID found");
      }
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
      
      if(_.isUndefined(hasAllowance)) {
        throw new Error("Allowance not found");
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
        await wrap({
          account,
          web3,
          chainId,
          tokenAddress: inTokenAddress,
          fromAmount,
          gas,
          onTxHash: (wrapTxHash) => {
            updateState({ wrapTxHash });
          },
        });
        inTokenAddress = wTokenAddress;
        updateState({ isWrapped: true });
      }
      if (!hasAllowance) {
        Logger("Approval required");
        updateState({ currentStep: STEPS.APPROVE });
        await approve({
          account,
          web3,
          chainId,
          fromToken: inTokenAddress,
          gas,
          onTxHash: (approveTxHash) => {
            updateState({ approveTxHash });
          },
        });
      } else {
        swapAnalytics.onApprovedBeforeTheTrade();
      }
      Logger("Signing...");
      updateState({ currentStep: STEPS.SEND_TX });
      const signature = await sign({
        account,
        web3,
        provider,
        permitData: quote.permitData,
      });
      updateState({ isSigned: true });
      Logger(signature);

      swapX({
        signature,
        inTokenAddress,
        outTokenAddress,
        fromAmount,
        quote: quote.originalQuote,
        account,
        chainId,
        apiUrl,
      }).then().catch();
      const txHash = await waitForSwap(chainId, apiUrl, sessionId, account);
      if (!txHash) {
        throw new Error("Swap failed");
      }
      Logger(txHash);
      updateState({ txHash });
      const txDetails = await waitForTxReceipt(web3, txHash);

      if (!txDetails?.mined) {
        throw new Error(txDetails?.revertMessage);
      }

      swapAnalytics.onClobOnChainSwapSuccess();
      updateState({ swapStatus: "success", failures: 0, sessionId: undefined });

      addOrder({
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: amountUi(fromToken.decimals, BN(fromAmount)),
        toAmount: amountUi(toToken.decimals, BN(quote.outAmount)) || "",
        txHash,
        explorerLink: `${explorerUrl}/tx/${txHash}`,
      });

      Logger("Swap success");
      swapAnalytics.clearState();
      return {
        txHash,
        receipt: txDetails.receipt,
      };
    },
    onSettled: () => refetchAllowance(),
    onError: (error) => {
    
      swapAnalytics.onClobFailure();
      // if user rejects the tx, we get back to confirmation step
      if (isTxRejected((error as Error).message)) {
        updateState({ swapStatus: undefined, currentStep: undefined });
        throw error;
      }
      Logger(`Swap error: ${error.message}`);
      updateState({
        swapStatus: "failed",
        sessionId: undefined,
        currentStep: undefined,
        failures: (failures || 0) + 1,
      });
      swapAnalytics.clearState();
      
    },
  });
};

async function waitForSwap(
  chainId: number,
  apiUrl: string,
  sessionId: string,
  user: string
) {
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
      // TODO, do we need to fail swap, in this api failure case?
      throw new Error(error.message);
    }
  }
}
