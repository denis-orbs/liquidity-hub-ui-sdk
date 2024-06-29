import React, { createContext, useContext, useEffect, useState } from "react";
import { SwapConfirmationArgs } from "../..";

interface Props extends SwapConfirmationArgs {
  children: React.ReactNode;
}

const SwapConfirmationContext = createContext({} as SwapConfirmationArgs);

export function SwapConfirmationProvider({ children, ...rest }: Props) {
  const [outAmount, setOutmount] = useState("");
  const [fromTokenUsd, setFromTokenUsd] = useState("");
  const [toTokenUsd, setToTokenUsd] = useState("");
  const { swapLoading } = rest;

  useEffect(() => {
    if (swapLoading) return;
    if (rest.fromTokenUsd) {
      setFromTokenUsd(rest.fromTokenUsd);
    }
  }, [rest.fromTokenUsd, swapLoading]);

  useEffect(() => {
    if (swapLoading) return;
    if (rest.toTokenUsd) {
      setToTokenUsd(rest.toTokenUsd);
    }
  }, [rest.toTokenUsd, swapLoading]);

  useEffect(() => {
    if (swapLoading) return;
    if (rest.outAmount) {
      setOutmount(rest.outAmount);
    }
  }, [rest.outAmount, swapLoading]);

  return (
    <SwapConfirmationContext.Provider
      value={{ ...rest, outAmount, fromTokenUsd, toTokenUsd }}
    >
      {children}
    </SwapConfirmationContext.Provider>
  );
}

export const useSwapConfirmationContext = () =>
  useContext(SwapConfirmationContext);
