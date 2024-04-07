import styled, { CSSObject } from "styled-components";
import { useSwapState } from "../../store/main";
import { PoweredByOrbs } from "../PoweredByOrbs";

export function ConfirmationPoweredBy({style = {}, className = ''}:{style?: CSSObject, className?: string}) {
  const { swapStatus } = useSwapState((s) => ({
    swapStatus: s.swapStatus,
  }));

  if (!swapStatus || swapStatus === "success") {
    return <StyledPoweredBy style={style} className={className} />;
  }

  return null;
}

const StyledPoweredBy = styled(PoweredByOrbs)`
  margin-top: 40px;
`;
