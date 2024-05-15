import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { amountUi, estimateGasPrice } from "../util";
import BN from "bignumber.js";
import { QUERY_KEYS } from "../config/consts";
import { useMainContext } from "../provider";
import { useQuery } from "@tanstack/react-query";
import { Token } from "../type";


export function useTokenUsdAmount({
    token,
    amount,
    usd,

  }: {
    token?: Token;
    amount?: string;
    usd?: string | number;

  }) {
    return useMemo(() => {
      return amountUi(
        token?.decimals,
        BN(amount || "0").multipliedBy(usd || "0")
      )
    }, [token, amount, usd]);
  }


export function useUsdAmounts({
  fromToken,
  fromAmount,
  inTokenUsd,
  toToken,
  outTokenUsd,
  outAmount,
}: {
  fromToken?: Token;
  fromAmount?: string;
  inTokenUsd?: string;
  toToken?: Token;
  outTokenUsd?: string;
  outAmount?: string;
}) {
  return useMemo(() => {
    return {
      inTokenUsdAmount: amountUi(
        fromToken?.decimals,
        BN(fromAmount || "0").multipliedBy(inTokenUsd || "0")
      ),
      outTokenUsdAmount: amountUi(
        toToken?.decimals,
        BN(outAmount || "0").multipliedBy(outTokenUsd || "0")
      ),
    };
  }, [fromToken, fromAmount, inTokenUsd, toToken, outAmount, outTokenUsd]);
}

export function usePriceImpact({
  inTokenUsdAmount,
  outTokenUsdAmount,
}: {
  inTokenUsdAmount?: string;
  outTokenUsdAmount?: string;
}) {
  return useMemo(() => {
    if (
      !outTokenUsdAmount ||
      !inTokenUsdAmount ||
      BN(outTokenUsdAmount || "0").isZero() ||
      BN(inTokenUsdAmount || "0").isZero()
    )
      return;
    return BN(outTokenUsdAmount)
      .div(inTokenUsdAmount)
      .minus(1)
      .times(100)
      .toString();
  }, [inTokenUsdAmount, outTokenUsdAmount]);
}

export function useGasCostUsd({outTokenUsd, toToken, gasCostOutputToken}:{outTokenUsd?: string, toToken?: Token, gasCostOutputToken?: string}) {
  return useMemo(() => {
    if (!gasCostOutputToken || !outTokenUsd) return;
    return amountUi(
      toToken?.decimals,
      BN(gasCostOutputToken).multipliedBy(outTokenUsd)
    );
  }, [gasCostOutputToken, outTokenUsd, toToken]);
}

export const useEstimateGasPrice = () => {
  const { web3, chainId } = useMainContext();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: async () => {
      const result = await estimateGasPrice(web3!, chainId!);
      const priorityFeePerGas = result?.fast.tip || 0;
      const maxFeePerGas = BN.max(result?.fast.max || 0, priorityFeePerGas);

      return {
        result,
        priorityFeePerGas,
        maxFeePerGas,
      };
    },
    refetchInterval: 15_000,
    enabled: !!web3 && !!chainId,
  });
};

export function useSlippage() {
  const contextSlippage = useMainContext().slippage;
  const storeSlippage = useSwapState(useShallow((s) => s.slippage));
  const slippage = storeSlippage || contextSlippage;

  return useMemo(() => {
    if (!slippage) return 0;
    return BN(slippage).isNaN() ? 0 : slippage;
  }, [slippage]);
}

export const useSwapConfirmation = () => {
  const store = useSwapState(
    useShallow((s) => ({
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showConfirmation: s.showConfirmation,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
    }))
  );

  const title = useMemo(() => {
    if (store.swapStatus === "failed") {
      return;
    }
    if (store.swapStatus === "success") {
      return "Swap Successfull";
    }
    return "Review Swap";
  }, [store.swapStatus]);


  return {
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    isOpen: !!store.showConfirmation,
    onClose: store.onCloseSwap,
    title,
  };
};
