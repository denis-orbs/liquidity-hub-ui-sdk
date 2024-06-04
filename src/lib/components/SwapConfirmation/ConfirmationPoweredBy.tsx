import styled, { CSSObject } from "styled-components";
import { ActionStatus } from "../../type";
import { PoweredByOrbs } from "../PoweredByOrbs";

export function ConfirmationPoweredBy({style = {}, className = '',swapStatus}:{style?: CSSObject, className?: string, swapStatus?: ActionStatus}) {


  if (!swapStatus || swapStatus === "success") {
    return <StyledPoweredBy style={style} className={className} />;
  }

  return null;
}

const StyledPoweredBy = styled(PoweredByOrbs)`
  margin-top: 40px;
`;
