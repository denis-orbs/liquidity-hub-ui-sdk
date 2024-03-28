import styled, { CSSObject } from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";
import { ReactNode, useEffect, useState } from "react";
import BN from "bignumber.js";

interface Props {
  className?: string;
  style?: CSSObject;
  children?: ReactNode;
  outAmount?: string;
}

export const SwapConfirmation = ({
  className = "",
  style = {},
  children,
  outAmount: _outAmount,
}: Props) => {
  const [outAmount, setOutAmount] = useState(_outAmount);
  const swapStatus = useSwapState(useShallow((s) => s.swapStatus));

  useEffect(() => {
    if (BN(_outAmount || '0').gt(0)) {
      setOutAmount(_outAmount);
    }
  }, [_outAmount]);

  return (
    <Container className={`${className} lh-summary`} $style={style}>
      {swapStatus === "success" ? (
        <SwapSuccess outAmount={outAmount} />
      ) : swapStatus === "failed" ? (
        <SwapFailed children={children} />
      ) : (
        <SwapMain outAmount={outAmount} children={children} />
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
