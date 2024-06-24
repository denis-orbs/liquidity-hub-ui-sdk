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

  useEffect(() => {
    if (rest.fromTokenUsd) {
      setFromTokenUsd(rest.fromTokenUsd);
    }
  }, [rest.fromTokenUsd]);

  useEffect(() => {
    if (rest.toTokenUsd) {
      setToTokenUsd(rest.toTokenUsd);
    }
  }, [rest.toTokenUsd]);

  useEffect(() => {
    if (rest.outAmount) {
      setOutmount(rest.outAmount);
    }
  }, [rest.outAmount]);

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
