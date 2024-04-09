import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, lightTheme } from "./theme";
import { ProviderArgs } from "./type";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ThemeProvider } from "styled-components";
import { DEFAULT_QUOTE_INTERVAL } from "./config/consts";
import Web3 from "web3";
import { swapAnalytics } from "./analytics";
import { useSwapState } from "./store/main";
import { useShallow } from "zustand/react/shallow";
import BN from "bignumber.js";
import { useDexState } from "./store/dex";
import { useLhControllListener } from "./hooks/useLhControllListener";
import { ForceIndicator } from "./components/ForceIndicator";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export interface Props extends ProviderArgs {
  children: ReactNode;
}

interface ContextArgs extends ProviderArgs {
  web3?: Web3;
}

const Context = createContext({} as ContextArgs);

export const LiquidityHubProvider = ({
  children,
  provider,
  account,
  chainId,
  partner,
  quoteInterval = DEFAULT_QUOTE_INTERVAL,
  apiUrl,
  supportedChains,
  theme,
  slippage: _slippage,
  maxFailures,
  connectWallet,
  getTokens,
}: Props) => {
  const slippage = useMemo(() => {
    if (!_slippage) return 0;
    return BN(_slippage).isNaN() ? 0 : Number(_slippage);
  }, [_slippage]);

  const reset = useSwapState(useShallow((s) => s.reset));
  const resetDex = useDexState(useShallow((s) => s.reset));
  const _theme = useMemo(() => {
    if (theme === "light") {
      return lightTheme;
    }
    return darkTheme;
  }, [theme]);

  

  const web3 = useMemo(
    () => (provider ? new Web3(provider) : undefined),
    [provider]
  );

  useEffect(() => {
    if (chainId && partner) {
      swapAnalytics.setChainId(chainId);
      swapAnalytics.setPartner(partner);
    }
  }, [chainId, partner]);

  useEffect(() => {
    reset();
    resetDex();
  }, [chainId]);

  useLhControllListener();

  return (
    <QueryClientProvider client={client}>
      <Context.Provider
        value={{
          provider,
          account,
          chainId,
          partner,
          quoteInterval,
          apiUrl,
          web3,
          supportedChains,
          slippage,
          maxFailures,
          connectWallet,
          getTokens,
        }}
      >
        <ThemeProvider theme={_theme}>
          <ForceIndicator />
          {children}
        </ThemeProvider>
      </Context.Provider>
    </QueryClientProvider>
  );
};

export const useMainContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useMainContext must be used within a LHProvider");
  }
  return context;
};
