import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { findTokenInList } from "../..";
import { useDexState } from "../../store/dex";
import { useTokens } from "./useTokens";

export function useInitialTokens(
  initialFromToken?: string,
  initialToToken?: string
) {
  const tokens = useTokens();

  const { fromToken, toToken, updateStore } = useDexState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      updateStore: s.updateStore,
    }))
  );  
  useEffect(() => {
    if (!fromToken && initialFromToken) {
      updateStore({
        fromToken: findTokenInList(tokens || [], initialFromToken),
      });
    }
    if (!toToken && initialToToken) {
      updateStore({ toToken: findTokenInList(tokens || [], initialToToken) });
    }
  }, [fromToken, toToken, initialFromToken, initialToToken, tokens, updateStore]);
}
