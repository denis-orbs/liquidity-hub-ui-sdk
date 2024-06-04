import { LiquidityHubPayload } from "../..";

export interface SwapConfirmationProps extends LiquidityHubPayload {
    fromTokenUsd?: string | number;
    toTokenUsd?: string | number;
    bottomContent?: React.ReactNode;
  }
  