import { QuoteResponse } from "../type";
export const WEBSITE_URL = "https://www.orbs.com/";
export const DEFAULT_QUOTE_INTERVAL = 10_000;

export enum QUERY_KEYS {
  TOKEN_BALANCE = "TOKEN_BALANCE",
  GET_TOKENS = "GET_TOKENS",
  GAS_PRICE = "GAS_PRICE",
  USD_PRICE = "USD_PRICE",
  TOKEN_BALANCES = "TOKEN_BALANCES",
  QUOTE = "QUOTE",
  APPROVE = "APPROVE",
  BALANCES = "BALANCES",
  TOKENS_LIST = "TOKENS_LIST",
}

export const LH_CONTROL_PARAM = "lh-control";
export const DEBUG_PARAM = "lh-debug";

export const DEFAULT_SLIPPAGE = 0.3;



export const QUOTE_ERRORS = {
  tns: "tns",
  noLiquidity: "no liquidity",
  ldv: "ldv",
  timeout: "timeout",
};

export const THENA_TOKENS_LIST_API =
  "https://lhthena.s3.us-east-2.amazonaws.com/token-list-lh.json";

export const FROM_AMOUNT_DEBOUNCE = 300;

export const EMPTY_QUOTE_RESPONSE = {
  inToken: "",
  outToken: "",
  inAmount: "string",
  outAmount: "string",
  user: "string",
  slippage: 0,
  qs: "string",
  partner: "string",
  exchange: "string",
  sessionId: "string",
  serializedOrder: "string",
  permitData: '',
  minAmountOut: "string",
  amountOutUI: "string",
  error: "string",
  gasAmountOut: "string",
} as QuoteResponse;

export const QUOTE_REFETCH_THROTTLE = 60_000;
export const QUOTE_REFETCH_INTERVAL = 20_000;
export const QUOTE_TIMEOUT = 10_000;


export const DEFAULT_QUOTE_REFETCH_LIMIT = 10;
export const USE_SUBMIT_SWAP_KEY = "use-submit-lh-swap";
