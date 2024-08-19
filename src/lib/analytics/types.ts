import { Token } from "../type";

type tradeType = "LIMIT" | "TWAP" | "V2" | "V3" | "BEST_TRADE";

export interface InitTrade {
  walletAddress?: string;
  srcAmount?: string;
  srcAmountUI?: string;
  tradeType?: tradeType;
  fromToken?: Token;
  toToken?: Token;
  fromTokenUsdAmount?: string;
  toTokenUsdAmount?: string;
  slippage?: number;
  chainId?: number;
  partner?: string;
  quoteAmountOut?: string;
  provider?: any;
  dexAmountOut?: string;
  dexOutAmountWS?: string;
  sessionId?: string;
}

export interface InitDexTrade extends InitTrade {
  chainId: number;
  partner: string;
}

type analyticsActionState = "pending" | "success" | "failed" | "null" | "";

export interface AnalyticsData {
  moduleLoaded: boolean;

  _id: string;
  partner?: string;
  chainId?: number;
  isForceClob: boolean;
  firstFailureSessionId?: string;
  sessionId?: string;
  walletAddress: string;

  dexAmountOut: string;
  dexAmountOutUi: string;

  dexOutAmountWS: string;
  dexOutAmountWSUi: string;

  isClobTrade: boolean;
  srcTokenAddress: string;
  srcTokenSymbol: string;
  dstTokenAddress: string;
  dstTokenSymbol: string;
  dstTokenUsdValue: number;
  srcTokenUsdValue: number;
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

  dexSwapState: analyticsActionState;
  dexSwapError: string;
  dexSwapTxHash: string;

  userWasApprovedBeforeTheTrade?: boolean | string;
  isProMode: boolean;
  expertMode: boolean;
  tradeType?: string;
  isNotClobTradeReason: string;
  onChainClobSwapState: analyticsActionState;
  version: number;
  isDexTrade: boolean;
  onChainDexSwapState: analyticsActionState;

  quoteAmountOut?: string;
  quoteAmountOutUI?: string;
  quoteAmountOutUsd?: number;

  quoteMinAmountOut?: string;
  quoteMinAmountOutUI?: string;

  quoteSerializedOrder?: string;
  quoteMillis?: number;
  quoteError?: string;
  walletConnectName?: string;
  isRabby?: boolean;
  isWalletConnect?: boolean;
  isCoinbaseWallet?: boolean;
  isOkxWallet?: boolean;
  isTrustWallet?: boolean;
  isMetaMask?: boolean;
}
