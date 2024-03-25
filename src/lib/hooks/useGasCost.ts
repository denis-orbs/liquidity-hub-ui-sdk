import { useMemo } from "react";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { useUsdValues } from "./useUsdValues";

export function useGasCost() {
  const { outTokenUsd } = useUsdValues();
  const gasCostOutputToken = useQuote().data?.gasCostOutputToken;

  console.log({ gasCostOutputToken, outTokenUsd });
  

  return useMemo(() => {
    if (!gasCostOutputToken || !outTokenUsd) return "";
    return BN(gasCostOutputToken).multipliedBy(outTokenUsd).toString();
  }, [gasCostOutputToken, outTokenUsd]);
}
