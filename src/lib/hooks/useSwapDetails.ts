import { useMemo } from "react";
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
  toToken?: Token;
  outTokenUsd?: string | number;
  inTokenUsd?: string | number;
  outAmount?: string;
}) {
  return useMemo(() => {
    return {
      inToken: amountUi(
        fromToken?.decimals,
        BN(fromAmount || "0").multipliedBy(inTokenUsd || "0")
      ),
      outToken: amountUi(
        toToken?.decimals,
        BN(outAmount || "0").multipliedBy(outTokenUsd || "0")
      ),
    };
  }, [fromToken, fromAmount, inTokenUsd, toToken, outAmount, outTokenUsd]);
}

export function usePriceImpact( inTokenUsdAmount?: string,outTokenUsdAmount?: string) {
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

export function useGasCostUsd(outTokenUsd?: string | number, toToken?: Token, gasCostOutputToken?: string) {
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

export function useSlippage(slippage?: string | number) {
  const contextSlippage = useMainContext().slippage;
  const _slippage = slippage || contextSlippage;

  return useMemo(() => {
    if (!_slippage) return 0;
    return BN(_slippage).isNaN() ? 0 : typeof _slippage === "string" ? parseFloat(_slippage) : _slippage;
  }, [_slippage]);
}

