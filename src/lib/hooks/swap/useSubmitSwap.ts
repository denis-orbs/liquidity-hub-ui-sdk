import { useChainConfig } from "../useChainConfig";
import {
  amountUi,
  delay,
  getTxDetailsFromApi,
  isNativeAddress,
  isNativeBalanceError,
  isTxRejected,
  Logger,
  waitForTxReceipt,
} from "../../util";
import BN from "bignumber.js";
import { zeroAddress } from "../../config/consts";
import { useOrders } from "../useOrders";
import {
  QuoteResponse,
  STEPS,
  Token,
  TxDetailsFromApi,
  UseLiquidityHubState,
} from "../../type";
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
  failures,
  getReceipt,
}: {
  fromAmount?: string;
  fromToken?: Token;
  toToken?: Token;
  quote?: QuoteResponse;
  updateState: (value: Partial<UseLiquidityHubState>) => void;
  sessionId?: string;
  failures: number;
  getReceipt?: boolean;
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

      if (_.isUndefined(hasAllowance)) {
        throw new Error("Allowance not found");
      }

      const isNativeIn = isNativeAddress(fromToken.address);
      const isNativeOut = isNativeAddress(toToken.address);

      let inTokenAddress = isNativeIn ? zeroAddress : fromToken.address;
      const outTokenAddress = isNativeOut ? zeroAddress : toToken.address;
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
      }
      updateState({ currentStep: STEPS.SEND_TX });
      const signature = await sign({
        account,
        web3,
        provider,
        permitData: quote.permitData,
      });
      updateState({ isSigned: true });

      swapX({
        signature,
        inTokenAddress,
        outTokenAddress,
        fromAmount,
        quote: quote.originalQuote,
        account,
        chainId,
        apiUrl,
      })
        .then()
        .catch();
      const txHash = await waitForSwap(chainId, apiUrl, sessionId, account);
      if (!txHash) {
        throw new Error("Swap failed");
      }
      updateState({ txHash });

      let receipt = "";
      let txDataFromApi: TxDetailsFromApi | undefined;
      try {
        if (getReceipt) {
          const result = await waitForTxReceipt(web3, txHash);
          if (!result?.mined) {
            throw new Error(result?.revertMessage);
          }
          receipt = result.receipt;
        } else {
          txDataFromApi = await getTxDetailsFromApi(txHash, chainId, quote);
        }
      } catch (error) {}

      updateState({ swapStatus: "success", failures: 0, sessionId: undefined });

      addOrder({
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: amountUi(fromToken.decimals, BN(fromAmount)),
        toAmount: amountUi(toToken.decimals, BN(quote.outAmount)) || "",
        txHash,
        explorerLink: `${explorerUrl}/tx/${txHash}`,
      });

      return {
        txHash,
        exactOutAmount: BN(txDataFromApi?.exactOutAmount || 0).gt(0)
          ? txDataFromApi?.exactOutAmount
          : undefined,
        gasCharges: txDataFromApi?.gasCharges,
        receipt,
      };
    },
    onSettled: () => refetchAllowance(),
    onError: (error) => {
      if (isTxRejected(error)) {
        updateState({ swapStatus: undefined, currentStep: undefined });
        throw error;
      }
      Logger(`Swap error: ${error.message}`);
      updateState({
        swapStatus: "failed",
        sessionId: undefined,
        currentStep: undefined,
        failures: isNativeBalanceError(error) ? 0 : (failures || 0) + 1,
      });
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
