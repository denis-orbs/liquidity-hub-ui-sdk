import { useMainContext } from "../provider";
import { useChainConfig } from "./useChainConfig";

export function useApiUrl() {
  const context = useMainContext();
  const chainConfig = useChainConfig();

  return context.apiUrl || chainConfig?.apiUrl;
}

