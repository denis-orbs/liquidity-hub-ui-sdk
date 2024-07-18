import React, { createContext, useContext, useEffect, useState } from "react";
import { SwapConfirmationArgs } from "../..";
import { useMainContext } from "../../context/MainContext";

interface Props extends SwapConfirmationArgs {
  children: React.ReactNode;
}

const SwapConfirmationContext = createContext({} as SwapConfirmationArgs);

export function SwapConfirmationProvider({ children, ...rest }: Props) {
  const [outAmount, setOutmount] = useState("");
  const [fromTokenUsd, setFromTokenUsd] = useState("");
  const [toTokenUsd, setToTokenUsd] = useState("");
  const [fromAmount, setFromAmount] = useState('')
  const {swapStatus } = useMainContext();

  const swapLoading = swapStatus === "loading";

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

  useEffect(() => {
    if (swapLoading) return;
    if (rest.fromAmount) {
      setFromAmount(rest.fromAmount);
    }
  }, [rest.fromAmount, swapLoading]);

  return (
    <SwapConfirmationContext.Provider
      value={{  outAmount, fromTokenUsd, toTokenUsd, fromAmount }}
    >
      {children}
    </SwapConfirmationContext.Provider>
  );
}

export const useSwapConfirmationContext = () =>
  useContext(SwapConfirmationContext);
