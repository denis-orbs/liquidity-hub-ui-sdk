import { FlexColumn, FlexRow } from "../../base-styles";
import { AlertCircle } from "react-feather";
import styled from "styled-components";
import { Text } from "../Text";
import { useChainConfig } from "../../hooks";
import { isNativeBalanceError } from "../../util";
import { useMemo } from "react";
import { useMainContext } from "../../context/MainContext";

const useGetError = (error?: string) => {
  const chainConfig = useChainConfig();
  return useMemo(() => {
    if (isNativeBalanceError(error)) {
      return `insufficient ${chainConfig?.native.symbol} balance`;
    }
    return "Swap failed on Liquidity Hub";
  }, [error, chainConfig?.native.symbol]);
};

export const SwapFailed = () => {
  const chainConfig = useChainConfig();
  const { state:{isWrapped, swapError} } = useMainContext();
  
  const error = useGetError(swapError);

  return (
    <Container className="lh-failed">
      <MainLogo className="lh-failed-img">
        <AlertCircle />
      </MainLogo>
      <Title className="lh-failed-title">{error}</Title>
      {isWrapped && chainConfig && (
        <Message>{`${chainConfig?.native.symbol} has been wrapped to ${chainConfig?.wToken?.symbol}`}</Message>
      )}
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
