import styled from "styled-components";
import BN from "bignumber.js";
import { FlexColumn, FlexRow } from "../../base-styles";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { Logo } from "../Logo";
import { Token } from "../../type";
import { Text } from "../Text";
import { useSwapConfirmation } from "../../hooks/useSwapConfirmation";
import { Separator } from "./Components";
import { useQuote } from "../../hooks/useQuote";
import { useMemo } from "react";
const StyledSwapDetails = styled(FlexColumn)`
  width: 100%;
  gap: 15px;
`;

export function SwapDetails({ outAmount }: { outAmount?: string }) {
  const { fromToken, fromAmount, toToken, inAmountUsd } = useSwapConfirmation();
  const outTokenUsd = useQuote().data?.outTokenUsd;
  const outAmountUsd = useMemo(() => {
    return BN(outTokenUsd || "")
      .multipliedBy(outAmount || 0)
      .toString();
  }, [outTokenUsd, outAmount]);

  return (
    <StyledSwapDetails className="lh-details">
      <TokenDisplay
        title="Swap from"
        usd={inAmountUsd}
        token={fromToken}
        amount={fromAmount}
      />
      <Separator />
      <TokenDisplay
        title="Swap to"
        usd={outAmountUsd}
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
  usd?: string | number;
  title: string;
}) => {
  if (!token) return null;

  const totalUsd = useFormatNumber({ value: usd });
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
          <USD className="lh-token-usd">
            {BN(totalUsd || 0).gt(0) ? `$${totalUsd}` : "-"}
          </USD>
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
  color: ${({ theme }) => theme.colors.textSecondary};
`;

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
