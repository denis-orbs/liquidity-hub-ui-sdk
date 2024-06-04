import { SwapConfirmationArgs } from "../../type";

export interface SwapConfirmationProps extends SwapConfirmationArgs {
    fromTokenUsd?: string | number;
    toTokenUsd?: string | number;
    bottomContent?: React.ReactNode;
  }
  