export interface QuoteArgs {
    fromToken: string;
    toToken: string;
    inAmount: string;
    minAmountOut?: string;
    account?: string;
    partner: string;
    slippage: number;
    signal?: AbortSignal;
    chainId: number;
    timeout?: number;
  }