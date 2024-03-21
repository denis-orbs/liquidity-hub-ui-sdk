import { FlexColumn, FlexRow } from "../../base-styles";
import { useChainConfig } from "../../hooks/useChainConfig";
import { useSwapState } from "../../store/main";
import { Token } from "../../type";
import styled from "styled-components";
import { Logo } from "../Logo";
import { Text } from "../Text";
import Confetti from "../../assets/confetti.svg";
import { Separator } from "./Components";
import { useSwapSuccessData } from "../../hooks/useSwapSuccessData";

export const SwapSuccess = () => {
  const { toToken, toAmount, fromToken, fromAmount } = useSwapSuccessData();

  return (
    <StyledSuccess className="lh-success">
      <StyledImg src={Confetti} />
      <StyledTokensContainer>
        <SuccessToken token={fromToken} amount={fromAmount} />
        <Separator />
        <SuccessToken token={toToken} amount={toAmount} />
      </StyledTokensContainer>
      <TXLink />
    </StyledSuccess>
  );
};

const StyledImg = styled("img")`
  width: 75px;
  height: 75px;
  object-fit: contain;
  margin-bottom: 40px;
`;

const StyledTokensContainer = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 30px;
`;

const TXLink = () => {
  const txHash = useSwapState((store) => store.txHash);
  const explorerUrl = useChainConfig()?.explorerUrl;

  return (
    <StyledLink
      className="lh-success-link"
      target="_blank"
      href={`${explorerUrl}/tx/${txHash}`}
    >
      View on explorer
    </StyledLink>
  );
};

const StyledLink = styled("a")`
  margin-top: 20px;
  color: #d284cf;
  font-size: 16px;
`;

const StyledLogo = styled(Logo)`
  width: 40px;
  height: 40px;
`;

const StyledTokenAmount = styled(Text)`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMain};
`;

const SuccessToken = ({
  token,
  amount,
}: {
  token?: Token;
  amount?: string;
}) => {
  return (
    <StyledTokenDisplay className="lh-success-token">
      <StyledTokenAmount className="lh-success-token-text">
        {amount}
      </StyledTokenAmount>
      <StyledLogoAndSymbol>
        <StyledLogo src={token?.logoUrl} className="lh-success-token-logo" />
        <StyledSymbol className="lh-success-token-symbol">
          {token?.symbol || "USDC"}
        </StyledSymbol>
      </StyledLogoAndSymbol>
    </StyledTokenDisplay>
  );
};

const StyledTokenDisplay = styled(FlexRow)`
  gap: 30px;
`;

const StyledSymbol = styled(Text)`
  font-size: 18px;
  font-weight: 500;
`;

const StyledLogoAndSymbol = styled(FlexRow)`
  gap: 10px;
`;

const StyledSuccess = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 20px;
`;
