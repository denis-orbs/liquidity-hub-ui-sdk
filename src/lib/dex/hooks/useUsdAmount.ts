import { useMemo } from "react";
import { usePriceUsd } from "./usePriceUsd";
import BN from "bignumber.js";

export const useUsdAmount = (address?: string, amount?: string) => {
  const { data: usd, isLoading } = usePriceUsd({ address });

  const result = useMemo(() => {
    if (!amount || !usd) return undefined;
    return BN(amount).multipliedBy(usd).toString();
  }, [amount, usd]);

  return { usd: result, isLoading };
};
