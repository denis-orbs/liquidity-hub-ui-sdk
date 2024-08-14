import styled, { CSSObject } from "styled-components";
import { SwapStatus } from "../../type";
import { PoweredByOrbs } from "../PoweredByOrbs";
import { useSwapConfirmationContext } from "./context";

export function PoweredBy({style = {}, className = ''}:{style?: CSSObject, className?: string}) {
  const {swapStatus} = useSwapConfirmationContext()

  if (!swapStatus  || swapStatus === SwapStatus.SUCCESS) {
    return <StyledPoweredBy style={style} className={className} />;
  }

  return null;
}

const StyledPoweredBy = styled(PoweredByOrbs)`
  margin-top: 30px;
`;
