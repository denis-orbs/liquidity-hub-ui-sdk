import styled, { CSSObject } from "styled-components";
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
  ...rest
}: Props) => {
  return (
    <SwapConfirmationProvider {...rest}>
      <Container className={`${className} lh-summary`} $style={style}>
        {rest.swapStatus === "success" ? (
          <SwapSuccess />
        ) : rest.swapStatus === "failed" ? (
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
