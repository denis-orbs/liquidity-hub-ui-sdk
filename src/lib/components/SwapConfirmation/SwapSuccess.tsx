import { FlexColumn, FlexRow } from "../../base-styles";
import { useChainConfig } from "../../hooks/useChainConfig";
import { useSwapState } from "../../store/main";
import { Token } from "../../type";
import styled from "styled-components";
import { Logo } from "../Logo";
import { Text } from "../Text";
import { Separator } from "./Components";
import { useFormatNumber } from "../../hooks";
import SuccessImg from "../../assets/okay.png";
import { useShallow } from "zustand/react/shallow";
import { useAmountUI } from "../../hooks/useAmountUI";

export const SwapSuccess = ({ outAmount }: { outAmount?: string }) => {
  const { fromToken, toToken, fromAmount } = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      fromAmount: s.fromAmount,
    }))
  );


  const fromAmountUI = useAmountUI(fromToken?.decimals, fromAmount);

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
        <SuccessToken token={fromToken} amount={fromAmountUI} />
        <Separator />
        <SuccessToken token={toToken} amount={outAmount} />
      </StyledTokensContainer>
      <TXLink />
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
    border-bottom: 1px solid #d284cf;s
  }
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
  margin-top: 50px;
  color: #d284cf;
  font-size: 16px;
  text-decoration: none;
  border-bottom: 1px solid #d284cf;s
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
  const formattedAmount = useFormatNumber({ value: amount });
  return (
    <StyledTokenDisplay className="lh-success-token">
      <StyledTokenAmount className="lh-success-token-text">
        {formattedAmount}
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
