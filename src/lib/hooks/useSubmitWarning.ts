import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import BN from "bignumber.js";
import { amountBN, Token, useQuote } from "..";
import { getBalances } from "../multicall";
const useBalance = (token?: Token) => {
  const { account, web3 } = useMainContext();

  return useQuery({
    queryKey: ["useBalance", token?.address, account],
    queryFn: async () => {
      const result = await getBalances([token!], web3!, account!);
      const balance = amountBN(token?.decimals, result[token?.address!]);
      return balance.toString();
    },
    enabled: !!account && !!token && !!web3,
  });
};

export function useSubmitWarning() {
  const { token, amount } = useSwapState(
    useShallow((s) => ({
      token: s.fromToken,
      amount: s.fromAmount,
    }))
  );
  const { data: balance, isLoading: loadingBalance } = useBalance(token);
  const outAmount = useQuote().data?.outAmount;

  const warning =  useMemo(() => {
    if (BN(balance || "0").isLessThan(amount || "0")) {
      return {
        type:'balance',
        text:'Insufficient balance'
      }
    }

    if (BN(outAmount || "0").isLessThan(0)) {
      return {
        type:'liquidity',
        text:'No liquidity for this trade'
      };
    }
  }, [balance, outAmount]);

  return warning ? {
    ...warning,
    isLoading: loadingBalance,
  } : null;
}
