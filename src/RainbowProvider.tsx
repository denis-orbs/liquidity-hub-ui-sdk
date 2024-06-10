import { ReactNode } from "react";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";

import {
  polygon,
  bsc,
  polygonZkEvm,
  base,
  fantom,
  linea,
  blast,
} from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// const INFURA_KEY = "7f79fe8f32bc4c29848c1f49a0b7fbb7";
const projectId = "c00c0bdae3ede8cf0073f900e6d17f09";
const appName = "Liquidity hub playground";
const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName,
  projectId,
  chains: [polygon, bsc, polygonZkEvm, base, fantom, linea, blast],
  ssr: false, // If your dApp uses server side rendering (SSR)
});




export const RainbowProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={darkTheme()}>
        {children}
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
  );
};
