import styled, { CSSObject } from "styled-components";
import { useMainContext } from "../../context/MainContext";
import { PoweredByOrbs } from "../PoweredByOrbs";

export function PoweredBy({style = {}, className = ''}:{style?: CSSObject, className?: string}) {
  const {swapStatus} = useMainContext()

  if (!swapStatus  || swapStatus === 'success') {
    return <StyledPoweredBy style={style} className={className} />;
  }

  return null;
}

const StyledPoweredBy = styled(PoweredByOrbs)`
  margin-top: 30px;
`;
