import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import styled from "styled-components";
import { Widget } from "./lib/dex/Widget";
import { RainbowProvider } from "./RainbowProvider";
import _ from "lodash";
import { Modal } from "./components/Modal";
import { networks } from "./lib/config/networks";
import Web3 from "web3";

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

function Wrapped() {
  const { address } = useAccount();
  const provider = useProvider();
  const connectedChainId =
    provider?.chainId && Web3.utils.hexToNumber(provider.chainId);

  const { openConnectModal } = useConnectModal();
  return (
    <Widget
      Modal={Modal}
      connectWallet={openConnectModal}
      provider={provider}
      chainId={connectedChainId}
      partner="playground"
      account={address}
      initialFromToken="USDT"
      supportedChains={_.map(networks, (it) => it.id)}
    />
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
