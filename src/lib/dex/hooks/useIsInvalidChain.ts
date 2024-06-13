
import { useMemo } from "react";

import _ from "lodash";
import { useMainContext } from "../../provider";
import { Logger } from "../../util";

export const useIsInvalidChain = () => {
  const { chainId, supportedChains } = useMainContext();

  
  return useMemo(() => {
    const invalid = chainId
      ? !supportedChains?.includes(chainId)
      : false;
    invalid && Logger("Invalid chain detected.");
    return invalid;
  }, [chainId, supportedChains]);
};
