import { useCallback, useEffect, useMemo, useState } from "react";
import { amountBN, amountUi, estimateGasPrice } from "../util";
import BN from "bignumber.js";
import { QUERY_KEYS } from "../config/consts";
import { useMainContext } from "../provider";
import { useQuery } from "@tanstack/react-query";
import { useAmountUI } from "./useAmountUI";
import { ActionStatus, QuoteResponse, Token } from "..";
import { getBalances } from "../multicall";

export function useGasCost(toToken?: Token, gasCostOutputToken?: string) {
  return useMemo(() => {
    if (!gasCostOutputToken) return;
    return {
      ui: amountUi(toToken?.decimals, BN(gasCostOutputToken)),
      raw: gasCostOutputToken,
    };
  }, [gasCostOutputToken, toToken]);
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



export const useBalance = (token?: Token) => {
  const { account, web3 } = useMainContext();

  return useQuery({
    queryKey: [QUERY_KEYS.TOKEN_BALANCE, token?.address, account],
    queryFn: async () => {
      const result = await getBalances([token!], web3!, account!);
      const balance = amountBN(token?.decimals, result[token?.address!]);
      return balance.toString();
    },
    enabled: !!account && !!token && !!web3,
  });
};


export function usePriceChanged({quote, showConfirmation, toToken, originalQuote, swapStatus}:{
  quote?: QuoteResponse,
  showConfirmation?: boolean,
  toToken?: Token,
  originalQuote?: QuoteResponse,
  swapStatus?: ActionStatus
}) {
  const [acceptedAmountOut, setAcceptedAmountOut] = useState<
    string | undefined
  >(undefined);


  useEffect(() => {
    // initiate
    if (showConfirmation && !acceptedAmountOut) {
      setAcceptedAmountOut(originalQuote?.minAmountOut);
    }
  }, [originalQuote, acceptedAmountOut, showConfirmation]);

  const acceptChanges = useCallback(() => {
    setAcceptedAmountOut(quote?.minAmountOut);
  }, [setAcceptedAmountOut, quote?.minAmountOut]);

  const shouldAccept = useMemo(() => {
    if (!acceptedAmountOut || !quote?.minAmountOut || swapStatus) return false;

    if (BN(quote.minAmountOut).isLessThan(BN(acceptedAmountOut))) {
      return true;
    }
  }, [acceptedAmountOut, quote?.minAmountOut, swapStatus]);

  return {
    shouldAccept,
    acceptChanges,
    newPrice: useAmountUI(toToken?.decimals, quote?.minAmountOut),
  };
}