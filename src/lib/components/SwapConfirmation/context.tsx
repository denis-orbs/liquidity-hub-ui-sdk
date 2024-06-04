import React, { createContext, useContext } from "react";
import { SwapConfirmationProps } from "./types";


interface Props extends SwapConfirmationProps {
  children: React.ReactNode;

}

const SwapConfirmationContext = createContext(
  {} as SwapConfirmationProps
);

export function SwapConfirmationProvider({
  children,
  fromTokenUsd,
  toTokenUsd,
  bottomContent,
  ...rest
}: Props) {
  return (
    <SwapConfirmationContext.Provider value={{ fromTokenUsd, toTokenUsd, bottomContent, ...rest }}>
      {children}
    </SwapConfirmationContext.Provider>
  );
}

export const useSwapConfirmationContext = () =>
  useContext(SwapConfirmationContext);
