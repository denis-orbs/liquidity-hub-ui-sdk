import styled, { CSSObject } from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";
import { SwapConfirmationProvider } from "./context";
import { SwapConfirmationProps } from "./types";

interface Props extends SwapConfirmationProps {
  className?: string;
  style?: CSSObject;
}

export const SwapConfirmation = ({
  className = "",
  style = {},
  bottomContent,
  fromTokenUsd,
  toTokenUsd,
}: Props) => {
  const swapStatus = useSwapState(useShallow((s) => s.swapStatus));

  return (
    <SwapConfirmationProvider
      fromTokenUsd={fromTokenUsd}
      toTokenUsd={toTokenUsd}
      bottomContent={bottomContent}
    >
      <Container className={`${className} lh-summary`} $style={style}>
        {swapStatus === "success" ? (
          <SwapSuccess />
        ) : swapStatus === "failed" ? (
          <SwapFailed />
        ) : (
          <SwapMain />
        )}
      </Container>
    </SwapConfirmationProvider>
  );
};

const Container = styled.div<{ $style: CSSObject }>`
  width: 100%;
  * {
    box-sizing: border-box;
  }
  ${({ $style }) => $style}
`;
