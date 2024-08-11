import { getChainConfig } from "../util";
import { useMemo } from "react";
import { useMainContext } from "../context/MainContext";

export function useChainConfig() {
  const chainId = useMainContext().chainId;
  return useMemo(() => {
    return getChainConfig(chainId);
  }, [chainId]);
}
