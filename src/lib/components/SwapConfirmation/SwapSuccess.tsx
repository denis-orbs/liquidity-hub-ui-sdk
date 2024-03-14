import { FlexColumn, FlexRow } from "../../base-styles";
import { useChainConfig } from "../../hooks/useChainConfig";
import { useSwapConfirmation } from "../../hooks/useSwapConfirmation";
import { useSwapState } from "../../store/main";
import { Token } from "../../type";
import { Check, ArrowRight } from "react-feather";
import styled from "styled-components";
import { Logo } from "../Logo";
import { Text } from "../Text";

export const SwapSuccess = () => {
  return (
    <StyledSuccess className="lh-success">
      <StyledSuccessLogo className="lh-success-img">
        <Check />
      </StyledSuccessLogo>
      <SuccessText className="lh-success-text">
        Swap success
      </SuccessText>
      <Bottom />
      <TXLink />
    </StyledSuccess>
  );
};

const TXLink = () => {
  const txHash = useSwapState((store) => store.txHash);
  const explorerUrl = useChainConfig()?.explorerUrl;

  return (
    <StyledLink className="lh-success-link" target="_blank" href={`${explorerUrl}/tx/${txHash}`}>
      View on explorer
    </StyledLink>
  );
};

const StyledLink = styled('a')`
  margin-top: 20px;
`;

const StyledArrow = styled(ArrowRight)`
  width: 20px;
  color: white;
  height: 20px;
`;

const StyledLogo = styled(Logo)`
  width: 24px;
  height: 24px;
`;

const StyledTokenText = styled(Text)`
  font-size: 15px;
`;

const SuccessToken = ({
  token,
  amount,
}: {
  token?: Token;
  amount?: string;
}) => {
  return (
    <FlexRow className="lh-swap-modal-success-token">
      <StyledLogo
        src={token?.logoUrl}
        className="lh-swap-modal-success-token-logo"
      />
      <StyledTokenText className="lh-swap-modal-success-token-text">
        {amount} {token?.symbol}
      </StyledTokenText>
    </FlexRow>
  );
};

const Bottom = () => {
  const { toToken, toAmount, fromToken, fromAmount } = useSwapConfirmation();

  return (
    <FlexRow>
      <SuccessToken token={fromToken} amount={fromAmount} />
      <StyledArrow />
      <SuccessToken token={toToken} amount={toAmount} />
    </FlexRow>
  );
};

const SuccessText = styled(Text)`
  font-size: 20px;
`;

const StyledSuccess = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 20px;
`;

const StyledSuccessLogo = styled(FlexRow)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4caf50;
  align-items: center;
  justify-content: center;
  svg {
    width: 60%;
    height: 60%;
    color: white;
  }
`;
