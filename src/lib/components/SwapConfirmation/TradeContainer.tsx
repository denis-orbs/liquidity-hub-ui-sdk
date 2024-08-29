import { ReactNode } from "react";
import { ArrowRight } from "react-feather";
import { styled } from "styled-components";
import { FlexColumn, FlexRow } from "../../base-styles";
import { Token } from "../../type";
import { Text } from "../Text";
import { useSwapConfirmationContext } from "./context";

interface Props {
  topElement?: ReactNode;
  title: ReactNode;
  variant: "success" | "pending";
  bottomElement?: ReactNode;
}

export function TradeContainer({ topElement, title, bottomElement }: Props) {
  return (
    <Container>
      {topElement}
      <StyledTitleAndPreview>
        {title}
        <SwapPreview />
      </StyledTitleAndPreview>
      <StyledBottomMsg>{bottomElement}</StyledBottomMsg>
    </Container>
  );
}

   const StyledBottomMsg = styled(Text)({
    fontSize: 14,
    marginTop: 60
  })
  

const StyledTitleAndPreview = styled(FlexColumn)({
    gap: 20,
    alignItems: "center",
    marginTop: 30
})

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});



export const SwapPreview = () => {
    const { fromToken, toToken, inAmount, outAmount } =
      useSwapConfirmationContext();
  
    return (
      <StyledSwapPreview>
        <TokenAmount token={fromToken} amount={inAmount} />
        <ArrowRight size={18} color="white" />
        <TokenAmount token={toToken} amount={outAmount} />
      </StyledSwapPreview>
    );
  };
  
  
  const StyledSwapPreview = styled(FlexRow)``;
  
  const TokenAmount = ({ token, amount }: { token?: Token; amount?: string }) => {
    return (
      <StyledTokenAmount className="lh-confirmation-token-preview">
        <StyledLogo src={token?.logoUrl} />
        <Text>
          {amount} {token?.symbol}
        </Text>
      </StyledTokenAmount>
    );
  };
  
  const StyledTokenAmount = styled(FlexRow)({
    alignItems: "center",
    p: {
      fontSize: 14,
    },
  });
  
  const StyledLogo = styled("img")({
    width: 20,
    height: 20,
    borderRadius: "50%",
    overflow: "hidden",
  });
  