import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

export const useProvider = () => {
    const { connector, address, isConnected } = useAccount();
  
    const [provider, setProvider] = useState<any>(undefined);
  
    const setProviderFromConnector = useCallback(async () => {
      try {
        const res = await connector?.getProvider();
        setProvider(res);
      } catch (error) {}
    }, [setProvider, connector, isConnected]);
  
    useEffect(() => {
      setProviderFromConnector();
    }, [address, setProviderFromConnector]);
  
    return provider;
  };