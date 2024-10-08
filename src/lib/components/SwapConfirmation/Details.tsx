import styled from "styled-components";
import { FlexColumn, FlexRow } from "../../base-styles";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { Logo } from "../Logo";
import { Token } from "../../type";
import { Text } from "../Text";
import { Separator } from "./Components";
import { useSwapConfirmationContext } from "./context";
const StyledSwapDetails = styled(FlexColumn)`
  width: 100%;
  gap: 15px;
`;

export function SwapDetails() {
  const { fromUsd, toUsd, outAmount, inAmount, fromToken, toToken } =
    useSwapConfirmationContext();


  return (
    <StyledSwapDetails className="lh-details">
      <TokenDisplay
        title="Swap from"
        usd={fromUsd}
        token={fromToken}
        amount={inAmount}
      />
      <Separator />
      <TokenDisplay
        title="Swap to"
        usd={toUsd}
        token={toToken}
        amount={outAmount}
      />
    </StyledSwapDetails>
  );
}

const TokenDisplay = ({
  amount,
  token,
  usd,
  title,
}: {
  amount?: string;
  token?: Token;
  usd?: string;
  title: string;
}) => {
  if (!token) return null;

  const _amount = useFormatNumber({ value: amount });

  return (
    <StyledTokenDisplay className="lh-token">
      <Title className="lh-token-title">{title}</Title>
      <FlexRow
        $justifyContent="space-between"
        $alignItems="flex-start"
        style={{ width: "100%" }}
      >
        <StyledLeft $alignItems="flex-start" className="lh-token-left">
          <TokenAmount className="lh-token-amount">{_amount}</TokenAmount>
          <USD className="lh-token-usd">{usd || "-"}</USD>
        </StyledLeft>
        <StyledLogoAndSymbol className="lh-token-right">
          <StyledLogo src={token.logoUrl} className="lh-token-logo" />
          <StyledSymbol className="lh-token-symbol">
            {token.symbol}
          </StyledSymbol>
        </StyledLogoAndSymbol>
      </FlexRow>
    </StyledTokenDisplay>
  );
};

const StyledLeft = styled(FlexColumn)`
  align-items: flex-start;
  gap: 8px;
`;

const StyledLogoAndSymbol = styled(FlexRow)``;

const StyledSymbol = styled(Text)`
  font-size: 18px;
`;

const StyledLogo = styled(Logo)`
  width: 36px;
  height: 36px;
`;

const USD = styled(Text)`
  font-size: 16px;
`;

const TokenAmount = styled(Text)`
  font-size: 30px;
  font-weight: 600;
`;

const Title = styled(Text)`
  font-size: 16px;
`;

const StyledTokenDisplay = styled(FlexColumn)`
  align-items: flex-start;
  width: 100%;
  gap: 8vpx;
`;
