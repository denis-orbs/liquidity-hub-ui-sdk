import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";

import { useTokens } from "./useTokens";
import { useIsInvalidChain } from "../../hooks";
import { eqIgnoreCase } from "../../util";
import { Token } from "../../type";
import { useDexState } from "../../store/dex";
const findToken = (tokens: Token[], addressOrSymbol: string) => {
  const res = tokens.find(
    (t) =>
      eqIgnoreCase(t.address, addressOrSymbol) || t.symbol === addressOrSymbol
  );
  return res;
};

export const useInitialTokens = (
  fromTokeAddressOrSymbol?: string,
  toTokenAddressOrSymbol?: string
) => {
  const invalidChain = useIsInvalidChain();
  const { updateState, fromToken, toToken } = useDexState(
    useShallow((s) => ({
      updateState: s.updateStore,
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );

  const tokens = useTokens();

  useEffect(() => {
    if (!tokens || invalidChain) return;
    if (!fromToken && fromTokeAddressOrSymbol) {
      updateState({
        fromToken: findToken(tokens, fromTokeAddressOrSymbol),
      });
    }
    if (!toToken && toTokenAddressOrSymbol) {
      updateState({
        toToken: findToken(tokens, toTokenAddressOrSymbol),
      });
    }
  }, [
    fromToken,
    toToken,
    fromTokeAddressOrSymbol,
    toTokenAddressOrSymbol,
    tokens,
    invalidChain,
  ]);
};
