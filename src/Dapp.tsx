import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "styled-components";
import { RainbowProvider } from "./RainbowProvider";
import _ from "lodash";
import { Widget } from "./Widget/Widget";
import { LiquidityHubProvider } from "./lib";

function Wrapped() {
  return (
    <LiquidityHubProvider partner="playground">
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
