import styled, { CSSObject } from "styled-components";
import { PoweredByOrbs } from "../PoweredByOrbs";
import { useSwapConfirmationContext } from "./context";

export function PoweredBy({style = {}, className = ''}:{style?: CSSObject, className?: string}) {
  const {swapStatus} = useSwapConfirmationContext().lhPayload

  if (!swapStatus || swapStatus === "success") {
    return <StyledPoweredBy style={style} className={className} />;
  }

  return null;
}

const StyledPoweredBy = styled(PoweredByOrbs)`
  margin-top: 40px;
`;
