import { getChainConfig } from '../util';
import  { useMemo } from 'react'
import { useMainContext } from '../provider';


export function useChainConfig() {
    const chainId = useMainContext().chainId;
  return useMemo(() => {
    return getChainConfig(chainId);
  }, [chainId]);
}

