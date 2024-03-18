import styled, { CSSObject } from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";
import { ReactNode } from "react";

export const SwapConfirmation = ({ className = '', style = {}, swapButton }: { className?: string, style?: CSSObject, swapButton: ReactNode}) => {
  const swapStatus = useSwapState(useShallow((s) => s.swapStatus));
  
  return (
    <Container className={`${className} lh-summary`} $style={style}>
      {swapStatus === "success" ? (
        <SwapSuccess />
      ) : swapStatus === "failed" ? (
        <SwapFailed />
      ) : (
        <SwapMain swapButton={swapButton} />
      )}
    </Container>
  );
};

const Container = styled.div<{$style: CSSObject}>`
  width: 100%;
  * {
    box-sizing: border-box;
  }
  ${({ $style }) => $style}
`;
