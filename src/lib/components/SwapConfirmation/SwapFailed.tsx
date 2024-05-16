import { FlexColumn, FlexRow } from "../../base-styles";
import { AlertCircle } from "react-feather";
import styled from "styled-components";
import { Text } from "../Text";
import { ReactNode } from "react";
import { LiquidityHubPayload } from "../..";

interface Props extends LiquidityHubPayload{
  children?: ReactNode
}

export const SwapFailed = (props:Props) => {
  
  const {confirmation, children} = props
 
  return (
    <Container className="lh-failed">
      <MainLogo className="lh-failed-img">
        <AlertCircle />
      </MainLogo>
      <Title className="lh-failed-title">{'Swap failed on Liquidity Hub'}</Title>
      {confirmation.swapError && <Message>{confirmation.swapError}</Message>}
      {children}
    </Container>
  );
};

const Message = styled(Text)`
  text-align: center;
  font-size: 16px;
  line-height: normal;
  margin-top: 5px;
`;

const Title = styled(Text)`
  font-size: 22px;
  font-weight: 500;
`;

const Container = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 20px;
`;

const MainLogo = styled(FlexRow)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ff3333;
  align-items: center;
  justify-content: center;
  svg {
    width: 60%;
    height: 60%;
    color: white;
  }
`;
