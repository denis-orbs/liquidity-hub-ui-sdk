import styled from "styled-components";
import { useSwapState } from "../../store/main";
import { PoweredByOrbs } from "../PoweredByOrbs";

export function ConfirmationPoweredBy() {
  const { swapStatus } = useSwapState((s) => ({
    swapStatus: s.swapStatus,
  }));

  if (!swapStatus || swapStatus === "success") {
    return <StyledPoweredBy />;
  }

  return null;
}

const StyledPoweredBy = styled(PoweredByOrbs)`
  margin-top: 40px;
`;
