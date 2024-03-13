import { useMemo } from "react";

import BN from "bignumber.js";
import { useEstimateGasPrice, useChainConfig } from "../../hooks";
import { amountUi } from "../../util";

export const useTransactionEstimateGasPrice = (
  nativeTokenPrice?: string | number
) => {
  const { data: gasPrice } = useEstimateGasPrice();

  const nativeTokenDecimals = useChainConfig()?.native.decimals;

  const price = gasPrice?.result.med.max;

  return useMemo(() => {
    if (!price || !nativeTokenPrice) return "0";
    const value = amountUi(nativeTokenDecimals, price.multipliedBy(750_000));
    return BN(nativeTokenPrice).multipliedBy(value).toString();
  }, [price, nativeTokenDecimals, nativeTokenPrice]);
};
