import styled from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";

export const SwapConfirmation = ({ className = '' }: { className?: string }) => {
  const swapStatus = useSwapState(useShallow((s) => s.swapStatus));
  
  return (
    <Container className={`${className} lh-swap-modal-summary`}>
      {swapStatus === "success" ? (
        <SwapSuccess />
      ) : swapStatus === "failed" ? (
        <SwapFailed />
      ) : (
        <SwapMain />
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  * {
    box-sizing: border-box;
  }
`;
