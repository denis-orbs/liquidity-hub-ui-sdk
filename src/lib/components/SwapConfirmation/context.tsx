import React, { createContext, useContext } from "react";
import { SwapConfirmationArgs } from "../..";

interface Props extends SwapConfirmationArgs {
  children: React.ReactNode;
}

const SwapConfirmationContext = createContext({} as SwapConfirmationArgs);

export function SwapConfirmationProvider({ children, ...rest }: Props) {
  return (
    <SwapConfirmationContext.Provider value={rest}>
      {children}
    </SwapConfirmationContext.Provider>
  );
}

export const useSwapConfirmationContext = () =>
  useContext(SwapConfirmationContext);
