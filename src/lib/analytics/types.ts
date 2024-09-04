

type analyticsActionState = "pending" | "success" | "failed" | "null" | "";

export interface AnalyticsData {
  moduleLoaded: boolean;
  liquidityHubDisabled: boolean;

  _id: string;
  partner?: string;
  chainId?: number;
  isForceClob: boolean;
  firstFailureSessionId?: string;
  sessionId?: string;
  walletAddress: string;

  dexAmountOut: string;

  dexOutAmountWS: string;

  isClobTrade: boolean;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmount: string;
  srcAmountUI: string;
  quoteIndex: number;
  slippage: number;
  quoteState: analyticsActionState;
  clobDexPriceDiffPercent: string;

  approvalState: analyticsActionState;
  approvalError: string;
  approvalMillis: number | null;

  signatureState: analyticsActionState;
  signatureMillis: number | null;
  signature: string;
  signatureError: string;

  swapState: analyticsActionState;
  txHash: string;
  swapMillis: number | null;
  swapError: string;

  wrapState: analyticsActionState;
  wrapMillis: number | null;
  wrapError: string;
  wrapTxHash: string;

  isNotClobTradeReason: string;
  onChainClobSwapState: analyticsActionState;
  version: number;
  isDexTrade: boolean;
  onChainDexSwapState: analyticsActionState;

  quoteAmountOut?: string;
  quoteMinAmountOut?: string;

  quoteSerializedOrder?: string;
  quoteMillis?: number;
  quoteError?: string;
  walletConnectName?: string;

  exactOutAmount?: string;
  gasCharges?: string;
}
