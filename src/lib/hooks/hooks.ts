import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { useEffect, useMemo, useRef, useState } from "react";
import { getChainConfig } from "../util";

export function useWrapOrUnwrapOnly(
  fromTokenAddress?: string,
  toTokenAddress?: string,
  chainId?: number
) {
  return useMemo(() => {
    const wTokenAddress = getChainConfig(chainId)?.wToken?.address;

    return {
      isWrapOnly: (
        eqIgnoreCase(wTokenAddress || "", toTokenAddress || "") &&
        isNativeAddress(fromTokenAddress || "")
      ),
      isUnwrapOnly: (
        eqIgnoreCase(wTokenAddress || "", fromTokenAddress || "") &&
        isNativeAddress(toTokenAddress || "")
      )
    };
  }, [chainId, fromTokenAddress, toTokenAddress]);
}




export const useCountdown = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prevSecondsLeft) => prevSecondsLeft - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft]);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const stop = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setSecondsLeft(initialSeconds);
    clearInterval(intervalRef.current);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return {
    start,
    stop,
    reset,
    minutes,
    seconds: seconds < 10 ? `0${seconds}` : seconds.toString(),
    secondsLeft
  };
};
