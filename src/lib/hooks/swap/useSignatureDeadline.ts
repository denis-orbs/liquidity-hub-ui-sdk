import { useCallback, useEffect } from "react";
import { useCountdown } from "../hooks";

export function useSignatureDeadline(onTimeout: () => Promise<void>) {
  const { start, secondsLeft, seconds, minutes, reset } = useCountdown(10);

  useEffect(() => {
    start();
  }, []);

  const onDeadline = useCallback(async () => {
    reset();
    await onTimeout();
    start();
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      onDeadline?.();
    }
  }, [secondsLeft, onDeadline]);

  return {
    minutes,
    seconds,
  };
}
