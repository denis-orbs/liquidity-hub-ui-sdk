import { ReactNode } from "react";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygon, bsc, polygonZkEvm, base } from "wagmi/chains";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import "@rainbow-me/rainbowkit/styles.css";

const INFURA_KEY = "7f79fe8f32bc4c29848c1f49a0b7fbb7";
const projectId = "c00c0bdae3ede8cf0073f900e6d17f09";
const APP_NAME = "Liquidity hub playground";

const { chains, publicClient } = configureChains(
  [polygon, bsc, polygonZkEvm, base],
  [infuraProvider({ apiKey: INFURA_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  projectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const RainbowProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
