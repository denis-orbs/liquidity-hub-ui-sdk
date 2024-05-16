import styled, { CSSObject } from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";
import { ReactNode} from "react";
import { LiquidityHubPayload } from "../../type";

interface Props extends LiquidityHubPayload {
  className?: string;
  style?: CSSObject;
  children?: ReactNode;
}

export const SwapConfirmation = ({
  className = "",
  style = {},
  children,
  ...rest
}: Props) => {
  
  return (
    <Container className={`${className} lh-summary`} $style={style}>
      {rest.swapStatus === "success" ? (
        <SwapSuccess {...rest} />
      ) : rest.swapStatus === "failed" ? (
        <SwapFailed {...rest} children={children} />
      ) : (
        <SwapMain {...rest} children={children} />
      )}
    </Container>
  );
};

const Container = styled.div<{ $style: CSSObject }>`
  width: 100%;
  * {
    box-sizing: border-box;
  }
  ${({ $style }) => $style}
`;
