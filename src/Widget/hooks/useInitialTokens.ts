import { useEffect } from "react";
import { useWidgetContext } from "../context";
import { findTokenInList } from "../utils";
import { useTokens } from "./useTokens";

export function useInitialTokens(
  initialFromToken?: string,
  initialToToken?: string
) {
  const tokens = useTokens();
  const context = useWidgetContext();

  const { fromToken, toToken } = context.state;
  useEffect(() => {
    if (!fromToken && initialFromToken) {
      context.updateState({
        fromToken: findTokenInList(tokens || [], initialFromToken),
      });
    }
    if (!toToken && initialToToken) {
      context.updateState({ toToken: findTokenInList(tokens || [], initialToToken) });
    }
  }, [
    fromToken,
    toToken,
    initialFromToken,
    initialToToken,
    tokens,
    context.updateState,
  ]);
}
