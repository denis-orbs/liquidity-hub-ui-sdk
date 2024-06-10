
import { useMemo } from "react";

import _ from "lodash";
import { useMainContext } from "../../provider";
import { networks } from "../../config/networks";
import { Logger } from "../../util";

export const useIsInvalidChain = () => {
  const { chainId } = useMainContext();
  return useMemo(() => {
    const invalid = chainId
      ? !_.map(networks, (it) => it.id).includes(chainId)
      : false;
    invalid && Logger("Invalid chain detected.");
    return invalid;
  }, [chainId]);
};
