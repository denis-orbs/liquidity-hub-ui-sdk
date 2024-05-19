import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useConfig, useNetwork } from "wagmi";
import styled from "styled-components";
import { Widget } from "./lib/dex/Widget";
import { supportedChains } from "./lib";
import { RainbowProvider } from "./RainbowProvider";
import _ from "lodash";
import { Modal } from "./components/Modal";

export const useProvider = () => {
  const { data } = useConfig();
  const { address, connector } = useAccount();

  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    const res = await connector?.getProvider();
    setProvider(res);
  }, [setProvider, connector]);

  useEffect(() => {
    const provider = (data as any)?.provider;
    if (provider) {
      setProvider(provider);
    } else {
      setProviderFromConnector();
    }
  }, [address, setProviderFromConnector, data]);

  return provider;
};

function Wrapped() {
  const { address } = useAccount();
  const provider = useProvider();

  const connectedChainId = useNetwork().chain?.id;
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
      supportedChains={_.map(supportedChains, "chainId")}
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
