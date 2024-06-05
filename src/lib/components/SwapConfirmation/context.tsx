import React, { createContext, useContext } from "react";
import { LiquidityHubPayload } from "../..";

interface ContextArgs {
  lhPayload: LiquidityHubPayload;
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
}

interface Props extends ContextArgs {
  children: React.ReactNode;
}

const SwapConfirmationContext = createContext({} as ContextArgs);

export function SwapConfirmationProvider({
  children,
  fromTokenUsd,
  toTokenUsd,
  lhPayload,
}: Props) {
  return (
    <SwapConfirmationContext.Provider
      value={{ fromTokenUsd, toTokenUsd, lhPayload }}
    >
      {children}
    </SwapConfirmationContext.Provider>
  );
}

export const useSwapConfirmationContext = () =>
  useContext(SwapConfirmationContext);
