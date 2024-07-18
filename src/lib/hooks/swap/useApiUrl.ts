import _ from "lodash";
import { useMemo } from "react";
import { useMainContext } from "../../context/MainContext";
import { getChainConfig } from "../../util";
import { useChainConfig } from "../useChainConfig";

export function useApiUrl() {
  const context = useMainContext();
  const chainConfig = useChainConfig();

  return useMemo(() => {
    const config =
      chainConfig || getChainConfig(_.first(context.supportedChains));
    return context.apiUrl || config?.apiUrl;
  }, [context.apiUrl, chainConfig, context.supportedChains]);
}
