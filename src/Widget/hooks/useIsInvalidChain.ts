
import { useMemo } from "react";
import _ from "lodash";
import { useMainContext } from "../../lib/context/MainContext";


export const useIsInvalidChain = () => {
  const { chainId, supportedChains } = useMainContext();

  
  return useMemo(() => {
   return  chainId
      ? !supportedChains?.includes(chainId)
      : false;

  }, [chainId, supportedChains]);
};
