import { useCallback, useEffect } from "react";
import { SIGNATURE_TIMEOUT_MILLIS } from "../../config/consts";
import { useCountdown } from "../hooks";

export function useSignatureTimeout(millis = SIGNATURE_TIMEOUT_MILLIS ) {
  const { start, secondsLeft, seconds, minutes, stop } = useCountdown(millis  / 1000);

  useEffect(() => {
    start()
  }, [])
  

  const onDeadline = useCallback(async () => {
    stop();
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
