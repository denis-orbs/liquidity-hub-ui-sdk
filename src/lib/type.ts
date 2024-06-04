import { AbiItem } from "web3-utils";
import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import { CSSObject } from "styled-components";
import { ReactNode } from "react";

export interface TokenPanelProps {
  inputValue?: string;
  onInputChange?: (value: string) => void;
  token?: Token;
  label?: string;
  isSrc?: boolean;
  onTokenSelect: (token: Token) => void;
  usd?: string;
  usdLoading?: boolean;
}

export type TokenListItemProps = {
  token: Token;
  selected?: boolean;
  balance?: string;
  balanceLoading?: boolean;
};

export interface WidgetConfig {
  styles?: CSSObject;
  layout?: WidgetLayout;
}

export interface WidgetLayout {
  tokenPanel?: {
    percentButtons?: { label: string; value: number }[];
    headerOutside?: boolean;
    inputSide?: "left" | "right";
    usdSide?: "left" | "right";
  };
}

export interface MainContextArgs {
  getTokens?: (chainId?: number) => Promise<Token[]>;
  getUsdPrice?: (address: string, chainId: number) => Promise<number>;
  connectWallet?: () => void;
}

export interface Token {
  name?: string;
  address: string;
  decimals: number;
  symbol: string;
  logoUrl?: string;
}

export interface ProviderArgs {
  supportedChains: number[];
  provider?: any;
  account?: string;
  chainId?: number;
  partner: string;
  apiUrl?: string;
  disableAnalytics?: boolean;
  theme?: "dark" | "light";
  connectWallet?: () => void;
  getTokens?: (chainId: number) => Promise<Token[] | undefined>;
  swap?: {
    maxFailures?: number;
  };
  quote?: {
    refetchInterval?: number;
    refetchUntilThrottle?: number;
  };
}

export interface QuoteArgs {
  inToken: string;
  outToken: string;
  inAmount: string;
  account?: string;
  slippage?: number;
  chainId: number;
  dexAmountOut?: string;
  signal?: AbortSignal;
  partner: string;
  apiUrl?: string;
}
export interface SendTxArgs {
  user: string;
  inToken: string;
  outToken: string;
  inAmount: string;
  outAmount: string;
  signature: string;
  quoteResult: any;
  chainId: number;
}

export interface ApproveArgs {
  user: string;
  inToken: string;
  inAmount: string;
  provider: any;
}

export interface UseSwapCallback {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
}

export interface OriginalQuote {
  inToken: string;
  outToken: string;
  inAmount: string;
  outAmount: string;
  user: string;
  slippage: number;
  qs: string;
  partner: string;
  exchange: string;
  sessionId: string;
  serializedOrder: string;
  permitData: PermitData;
  minAmountOut: string;
  amountOutUI: string;
  error?: string;
}

export interface QuoteResponse extends OriginalQuote {
  disableInterval?: boolean;
  gasCostOutputToken?: string;
  refetchCount?: number;
  ui: {
    outAmount?: string;
    minAmountOut?: string;
    gasCostOutputToken?: string;
  };
}

export enum LH_CONTROL {
  FORCE = "1",
  SKIP = "2",
  RESET = "3",
}

export enum STEPS {
  WRAP,
  APPROVE,
  SEND_TX,
}

export type ActionStatus =
  | "pending"
  | "loading"
  | "success"
  | "failed"
  | undefined;

export interface Step {
  title: ReactNode;
  link?: { href: string; text: string };
  image?: string;
  hidden?: boolean;
  id: STEPS;
}

export type UseLiquidityHubArgs = {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  minAmountOut?: string;
  slippage?: number;
  disabled?: boolean;
  debounceFromAmountMillis?: number;
  quoteDelayMillis?: number;
  outAmount?: string;
};

export type SwapRoute = "dex" | "lh";

export type AddOrderArgs = {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  txHash: string;
  explorerLink: string;
};

export type Order = {
  id: string;
  date: number;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  txHash: string;
  explorerLink: string;
};

export type Orders = { [address: string]: { [chain: string]: Order[] } };

export interface Network {
  native: Token;
  wToken?: Token;
  chainId: number;
  chainName: string;
  explorerUrl: string;
  getTokens?: () => Promise<Token[]>;
  apiUrl: string;
}

export type Abi = AbiItem[];
export type Balances = { [key: string]: string };

export declare type PermitData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  values: any;
};
