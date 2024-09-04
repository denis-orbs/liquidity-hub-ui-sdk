export interface TypedDataField {
  name: string;
  type: string;
}

export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: number | string;
  verifyingContract?: string;
  salt?: string;
}

export type PermitData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  values: any;
};

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
  sessionId?: string;
  timeout?: number;
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
  permitData: any;
  minAmountOut: string;
  error?: string;
  gasAmountOut?: string;
}
