
import { Token } from "../../../type";
import styled from "styled-components";
import { Logo } from "../../Logo";
import { Text } from "../../Text";
import { Separator } from "../Components";
import SuccessImg from "../../../assets/okay.png";
import { ExplorerLink } from "../../ExplorerLink";
import { useSwapConfirmationContext } from "../context";
import { FlexColumn, FlexRow } from "../../../base-styles";

export const SwapSuccess = () => {
  const { outAmount, inAmount, fromToken, toToken, txHash } = useSwapConfirmationContext();

  return (
    <StyledSuccess className="lh-success">
      <StyledTop>
        <StyledImg src={SuccessImg} />
        <TopText>
          Successfully Swapped <br /> Using{" "}
          <a href="https://www.orbs.com/liquidity-hub/" target="_blank">
            Liquidity Hub
          </a>
        </TopText>
      </StyledTop>

      <StyledTokensContainer>
        <SuccessToken token={fromToken} amount={inAmount} />
        <Separator />
        <SuccessToken token={toToken} amount={outAmount} />
      </StyledTokensContainer>
      <ExplorerLink styles={{ marginTop: 50 }} txHash={txHash} />
    </StyledSuccess>
  );
};

const StyledImg = styled.img`
  width: 63px;
  height: 63px;
`;

const StyledTop = styled(FlexColumn)`
  gap: 20px;
  margin-bottom: 40px;
  align-items: center;
`;

const TopText = styled(Text)`
  line-height: 24px;
  font-size: 16px;
  text-align: center;
  a {
    color: #d284cf;
    text-decoration: none;
    border-bottom: 1px solid #d284cf;
  }
`;

const StyledTokensContainer = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 30px;
`;

const StyledLogo = styled(Logo)`
  width: 40px;
  height: 40px;
`;

const StyledTokenAmount = styled(Text)`
  font-size: 28px;
  font-weight: 600;
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
  gap: 13px;
`;

const StyledSuccess = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 0px;
`;
