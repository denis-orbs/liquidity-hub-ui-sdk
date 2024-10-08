import { FlexColumn, FlexRow } from "../../../base-styles";
import { AlertCircle } from "react-feather";
import styled from "styled-components";
import { Text } from "../../Text";
import { getChainConfig, isNativeBalanceError } from "../../../util";
import { useMemo } from "react";
import { useSwapConfirmationContext } from "../context";

const useGetError = () => {
  const { chainId, error } = useSwapConfirmationContext();

  const chainConfig = useMemo(() => getChainConfig(chainId), [chainId]);
  return useMemo(() => {
    if (isNativeBalanceError(error)) {
      return `insufficient ${chainConfig?.native.symbol} balance`;
    }
    return "Swap failed on Liquidity Hub";
  }, [error, chainConfig?.native.symbol]);
};

export const FailedContent = () => {
  const error = useGetError();

  return (
    <Container className="lh-failed">
      <MainLogo className="lh-failed-img">
        <AlertCircle />
      </MainLogo>
      <Title className="lh-failed-title">{error}</Title>
      {/* {isWrapped && chainConfig && (
        <Message>{`${chainConfig?.native.symbol} has been wrapped to ${chainConfig?.wToken?.symbol}`}</Message>
      )} */}
      {/* <Message>{_error}</Message> */}
    </Container>
  );
};

// const Message = styled(Text)`
//   text-align: center;
//   font-size: 16px;
//   line-height: normal;
//   margin-top: 5px;
// `;
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
