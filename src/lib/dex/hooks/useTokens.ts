import BN from "bignumber.js";
import _ from "lodash";
import { useTokensList } from "./useTokenList";
import { useMemo } from "react";
import { useTokenListBalances } from "./useTokenListBalances";
import { zeroAddress } from "viem";
import { eqIgnoreCase } from "../../util";

export const useTokens = () => {
  const { data: list } = useTokensList();
  const { data: balances } = useTokenListBalances();

  return useMemo(() => {
    let tokens = list;
    if (!tokens) {
      return [];
    }
    if (!balances) {
      return tokens;
    }
    let sorted = _.orderBy(
      tokens,
      (t) => {
        return new BN(balances?.[t.address] || "0");
      },
      ["desc"]
    );

    const nativeTokenIndex = _.findIndex(sorted, (t) =>
      eqIgnoreCase(t.address, zeroAddress)
    );

    if (nativeTokenIndex !== -1) {
      const nativeToken = sorted[nativeTokenIndex];
      sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
      sorted.unshift(nativeToken);
    }

    return sorted;
  }, [balances, list]);
};
