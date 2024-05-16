import { AbiItem } from "web3-utils";
import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import { CSSObject } from "styled-components";
import { ReactNode } from "react";
import { useLiquidityHub } from ".";

export interface TokenPanelProps {
  inputValue?: string;
  onInputChange?: (value: string) => void;
  token?: Token;
  label?: string;
  isSrc?: boolean;
  onTokenSelect: (token: Token) => void;
  usd?: string;
}

export interface ModalStyles {
  bodyStyles?: CSSObject;
  containerStyles?: CSSObject;
}

export type TokenListItemProps = {
  token: Token;
  selected?: boolean;
  balance?: string;
  balanceLoading?: boolean;
  usd?: string;
  usdLoading: boolean;
};

export interface WidgetConfig {
  styles?: CSSObject;
  layout?: WidgetLayout;
  modalStyles?: ModalStyles;
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
  slippage?: number;
  provider?: any;
  account?: string;
  chainId?: number;
  partner: string;
  apiUrl?: string;
  quoteInterval?: number;
  disableAnalytics?: boolean;
  theme?: "dark" | "light";
  maxFailures?: number;
  connectWallet?: () => void;
  getTokens?: (chainId: number) => Promise<Token[] | undefined>;
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

export interface QuoteResponse {
  outAmount: string;
  permitData: any;
  serializedOrder: string;
  callData: string;
  rawData: any;
  sessionId?: string;
  disableInterval?: boolean;
  gasCostOutputToken?: string;
  minAmountOut?: string;
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

export type QuoteQueryArgs = {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  dexMinAmountOut?: string;
};

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
  inTokenUsd?: string | number;
  outTokenUsd?: string | number;
  onWrapSuccess?: () => void;
};

export type TradeOwner = "dex" | "lh";

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
  fromUsd?: string | number;
  toUsd?: string | number;
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



export type LiquidityHubPayload = ReturnType<typeof useLiquidityHub>