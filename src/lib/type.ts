import { AbiItem } from "web3-utils";
import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import { ReactNode } from "react";

export interface Token {
  name?: string;
  address: string;
  decimals: number;
  symbol: string;
  logoUrl?: string;
}

export interface ProviderArgs {
  supportedChains?: number[];
  provider?: any;
  account?: string;
  chainId?: number;
  partner: string;
  apiUrl?: string;
  quoteRefetchInterval?: number;
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

export interface Quote {
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
  gasAmountOut?: string;
}

export interface QuoteResponse {
  disableRefetch?: boolean;
  quote?: Quote;
}

export interface UseQueryData {
  quoteResponse: QuoteResponse | undefined;
  refetchCount?: number;
  resetCount?: () => void;
  isPassedLimit?: boolean;
}

export enum LH_CONTROL {
  FORCE = "1",
  SKIP = "2",
  RESET = "3",
}

export type SwapSteps = "wrap" | "approve" | "sign" | "swap" | undefined;

export type SwapStatus = "loading" | "success" | "failed" | undefined;

export interface Step {
  title: ReactNode;
  link?: { href: string; text: string };
  image?: string;
  hidden?: boolean;
  id: SwapSteps;
  txHash?: string;
  completed?: boolean;
}

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
  id: number;
  name: string;
  shortname: string;
  native: {
    address: string;
    symbol: string;
    decimals: number;
    logoUrl: string;
  };
  wToken: {
    symbol: string;
    address: string;
    decimals: number;
    logoUrl: string;
  };
  logoUrl: string;
  explorer: string;
  apiUrl: string;
  eip1559: boolean;
  baseGasPrice: number;
  pendingBlocks: boolean;
  publicRpcUrl: string;
}

export type Abi = AbiItem[];


export declare type PermitData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  values: any;
};

export interface SwapConfirmationArgs {
  fromTokenUsd?: string;
  toTokenUsd?: string;
  outAmount?: string;
  fromAmount?: string;
  fromToken?: Token;
  toToken?: Token;
  swapStep?: SwapSteps;
  swapStatus?: SwapStatus;
  error?: string;
  txHash?: string;
  hasAllowance?: boolean;
  isLightMode?: boolean;
}

export interface SDKProps extends ProviderArgs {
  children: ReactNode;
}
