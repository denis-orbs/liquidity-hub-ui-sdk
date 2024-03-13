import { useMemo } from "react";
import styled from "styled-components";
import BN from "bignumber.js";
import { FlexColumn, FlexRow } from "../../base-styles";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { Logo } from "../Logo";
import { Token } from "../../type";
import { Text } from "../Text";
import { useSwapConfirmation } from "../../hooks/useSwapConfirmation";
import SwitchArrow from '../../assets/switch-arrow.svg';
const StyledSwapDetails = styled(FlexColumn)`
  width: 100%;
  gap: 15px;
`;

export function SwapDetails() {
  const { fromToken, fromAmount, toAmount, toToken, fromTokenUsd, toTokenUsd } = useSwapConfirmation();

  return (
    <StyledSwapDetails className="lh-summary-details">
      <TokenDisplay
        title="Swap from"
        usd={fromTokenUsd}
        token={fromToken}
        amount={fromAmount}
      />
      <Separator />
      <TokenDisplay
        title="Swap to"
        usd={toTokenUsd}
        token={toToken}
        amount={toAmount}
      />
    </StyledSwapDetails>
  );
}

const Separator = () => {
  return <StyledSeparator className="lh-summary-separator">
    <StyledSeparatorCenter className="lh-summary-separator-center">
    <img src={SwitchArrow} />
    </StyledSeparatorCenter>
      
  </StyledSeparator>
}

const StyledSeparatorCenter = styled(FlexRow)`
  background-color: #1C1924;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  img {
    width: 20px;
  }
`

const StyledSeparator = styled(FlexRow)`
  color: white;
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #433D53;
  }
`

const TokenDisplay = ({
  amount,
  token,
  usd,
  title,
}: {
  amount?: string;
  token?: Token;
  usd?: string | number;
  title: string;
}) => {
  if (!token) return null;

  const totalUsd = useMemo(() => {
    if (!usd || !amount) {
      return "0";
    }
    return new BN(usd).times(amount).toString();
  }, [usd, amount]);

  const _totalUsd = useFormatNumber({ value: totalUsd });
  const _amount = useFormatNumber({ value: amount });

  return (
    <StyledTokenDisplay className="lh-summary-token">
      <Title className="lh-summary-token-title">{title}</Title>
      <FlexRow
        $justifyContent="space-between"
        $alignItems="flex-start"
        style={{ width: "100%" }}
      >
        <FlexColumn $alignItems="flex-start">
          <TokenAmount>
            {_amount}
          </TokenAmount>
          {_totalUsd && (
            <USD className="lh-swap-modal-usd">{`$${_totalUsd}`}</USD>
          )}
        </FlexColumn>
        <StyledLogoAndSymbol>
        <StyledLogo src={token.logoUrl} />
        <StyledSymbol>{token.symbol}</StyledSymbol>
        </StyledLogoAndSymbol>
      
      </FlexRow>
    </StyledTokenDisplay>
  );
};

const StyledLogoAndSymbol = styled(FlexRow)``

const StyledSymbol = styled(Text)`
font-size: 18px;
color: ${({ theme }) => theme.colors.textSecondary};
`

const StyledLogo = styled(Logo)`
  width: 36px;
  height: 36px;
`;

const USD = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSmall};
`;

const TokenAmount = styled(Text)`
  font-size: 30px;
  font-weight: 600;
`;

const Title = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledTokenDisplay = styled(FlexColumn)`
  align-items: flex-start;
  width: 100%;
  gap: 8vpx;
`;
