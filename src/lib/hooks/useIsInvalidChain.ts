import { useMainContext } from "../provider";
import { useMemo } from "react";

export const useIsInvalidChain = () => {
  const { chainId, supportedChains } = useMainContext();
  return useMemo(() => {
    return chainId ? !supportedChains.includes(chainId) : false;
  }, [chainId, supportedChains]);
};
