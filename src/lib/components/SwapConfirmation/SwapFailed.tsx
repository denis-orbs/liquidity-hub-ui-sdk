import { FlexColumn, FlexRow } from "../../base-styles";
import { AlertCircle } from "react-feather";
import styled from "styled-components";
import { Text } from "../Text";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { useChainConfig } from "../../hooks";
import { ReactNode } from "react";

export const SwapFailed = ({children}:{children?: ReactNode}) => {
  const { swapStaus, isWrapped, swapError } = useSwapState(
    useShallow((s) => ({
      isWrapped: s.isWrapped,
      swapStaus: s.swapStatus,
      swapError: s.swapError
    }))
  );

  const chainConfig = useChainConfig();
  return (
    <Container className="lh-failed">
      <MainLogo className="lh-failed-img">
        <AlertCircle />
      </MainLogo>
      <Title className="lh-failed-title">{swapError || 'Swap failed on Liquidity Hub'}</Title>
      {swapStaus === "failed" && isWrapped && (
        <Message>{chainConfig?.native.symbol} has been wrapped to {chainConfig?.wToken?.symbol}</Message>
      )}
      {children}
    </Container>
  );
};

const Message = styled(Text)`
  text-align: center;
  font-size: 15px;
  line-height: normal;
  margin-top: 5px;
`;

const Title = styled(Text)`
  font-size: 20px;
  font-weight:500;
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
