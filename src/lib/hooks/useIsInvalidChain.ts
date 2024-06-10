import { useMainContext } from "../provider";
import { useMemo } from "react";

export const useIsInvalidChain = () => {
  const { chainId, supportedChains } = useMainContext();
  return useMemo(() => {
    const invalid = chainId ? !supportedChains?.includes(chainId) : false
    return invalid
  }, [chainId, supportedChains]);
};
