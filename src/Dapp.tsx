import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import styled from "styled-components";
import { RainbowProvider } from "./RainbowProvider";
import _ from "lodash";
import Web3 from "web3";
import { Widget } from "./Widget/Widget";
import { LiquidityHubProvider } from "./lib";
import { networks } from "@defi.org/web3-candies";

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

const supportedChains = _.map(networks, (it) => it.id);

function Wrapped() {
  const { address } = useAccount();
  const provider = useProvider();
  const connectedChainId =
    provider?.chainId && Web3.utils.hexToNumber(provider.chainId);

  return (
    <LiquidityHubProvider
      provider={provider}
      chainId={connectedChainId}
      partner="playground"
      account={address}
      supportedChains={supportedChains}
    >
      <Widget initialFromToken="USDC" initialToToken="WBNB" slippage={0.5} />
    </LiquidityHubProvider>
  );
}

const Dapp = () => {
  return (
    <RainbowProvider>
      <Container>
        <ConnectButton />
        <Wrapped />
      </Container>
    </RainbowProvider>
  );
};

export default Dapp;

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  gap: 20px;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;
