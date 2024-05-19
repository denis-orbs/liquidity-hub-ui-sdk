import BN, { BigNumber } from "bignumber.js";
import Web3 from "web3";
import { Network, Token } from "./type";
import _ from "lodash";
import { supportedChains } from "./config/supportedChains";
import { nativeTokenAddresses, QUOTE_ERRORS, zero } from "./config/consts";
import { networks } from "./networks";
import { numericFormatter } from "react-number-format";
import { useLiquidityHubPersistedStore } from "./store/main";
import erc20abi from "./abi/ERC20Abi.json";
import iwethabi from "./abi/IWETHAbi.json";

export const amountBN = (decimals?: number, amount?: string) =>
  parsebn(amount || "")
    .times(new BN(10).pow(decimals || 0))
    .decimalPlaces(0);

export const amountUi = (decimals?: number, amount?: BN) => {
  if (!decimals || !amount) return "";
  const percision = new BN(10).pow(decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toString();
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getChainConfig = (chainId?: number): Network | undefined => {
  if (!chainId) return undefined;
  return Object.values(supportedChains).find((it) => it.chainId === chainId);
};

export async function waitForTxReceipt(web3: Web3, txHash: string) {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const { mined, revertMessage } = await getTransactionDetails(
        web3,
        txHash
      );

      if (mined) {
        return {
          mined,
          revertMessage: undefined,
        };
      }
      if (revertMessage) {
        return {
          mined: false,
          revertMessage,
        };
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export async function getTransactionDetails(
  web3: Web3,
  txHash: string
): Promise<{ mined: boolean; revertMessage?: string, receipt?: any }> {
  let receipt
  try {
     receipt = await web3.eth.getTransactionReceipt(txHash);
    if (!receipt) {
      return {
        mined: false,
      };
    }

    let revertMessage = "";

    if (!receipt.status) {
      // If the transaction was reverted, try to get the revert reason.
      try {
        const tx = await web3.eth.getTransaction(txHash);
        const code = await web3.eth.call(tx as any, tx.blockNumber!);
        revertMessage = web3.utils.toAscii(code).replace(/\0/g, ""); // Convert the result to a readable string
      } catch (err) {
        revertMessage = "Unable to retrieve revert reason";
      }
    }

    return {
      mined: receipt.status ? true : false,
      revertMessage,
      receipt
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch transaction details: ${error.message}`);
  }
}

export const deductSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;

  return new BigNumber(amount)
    .times(100 - slippage)
    .div(100)
    .toString();
};

export const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};


export const shouldReturnZeroOutAmount = (error: string) => {
  return Object.values(QUOTE_ERRORS).includes(error);
};

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}
export const isNativeAddress = (address: string) =>
  !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address));

export function bn(n: BN.Value, base?: number): BN {
  if (n instanceof BN) return n;
  if (!n) return zero;
  return BN(n, base);
}

export async function sendAndWaitForConfirmations(
  web3: Web3,
  chainId: number,
  tx: any,
  opts: any,
  confirmations: number = 0,
  autoGas?: "fast" | "med" | "slow"
) {
  if (!tx && !opts.to) throw new Error("tx or opts.to must be specified");

  const [nonce, chain, price] = await Promise.all([
    web3.eth.getTransactionCount(opts.from),
    chainId,
    autoGas ? estimateGasPrice(web3, chainId) : Promise.resolve(),
  ]);
  const maxFeePerGas = BN.max(
    autoGas ? price?.[autoGas]?.max || 0 : 0,
    bn(opts.maxFeePerGas || 0),
    0
  );
  const maxPriorityFeePerGas = BN.max(
    autoGas ? price?.[autoGas]?.tip || 0 : 0,
    bn(opts.maxPriorityFeePerGas || 0),
    0
  );

  const options = {
    value: opts.value ? bn(opts.value).toFixed(0) : 0,
    from: opts.from,
    to: opts.to,
    gas: 0,
    nonce,
    maxFeePerGas: maxFeePerGas.isZero() ? undefined : maxFeePerGas.toFixed(0),
    maxPriorityFeePerGas: maxPriorityFeePerGas.isZero()
      ? undefined
      : maxPriorityFeePerGas.toFixed(0),
  };

  if (!network(chain).eip1559) {
    (options as any).gasPrice = options.maxFeePerGas;
    delete options.maxFeePerGas;
    delete options.maxPriorityFeePerGas;
  }

  const estimated = await (tx?.estimateGas({ ...options }) ||
    web3.eth.estimateGas({ ...options }));
  options.gas = Math.floor(estimated * 1.2);

  const promiEvent = tx ? tx.send(options) : web3.eth.sendTransaction(options);

  let sentBlock = Number.POSITIVE_INFINITY;
  promiEvent.once("receipt", (r: any) => (sentBlock = r.blockNumber));

  const result = await promiEvent;

  while (
    (await web3.eth.getTransactionCount(opts.from)) === nonce ||
    (await web3.eth.getBlockNumber()) < sentBlock + confirmations
  ) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  return result;
}

export async function estimateGasPrice(
  web3: Web3,
  chainId: number,
  percentiles: number[] = [10, 50, 90],
  length: number = 5
): Promise<{
  slow: { max: BN; tip: BN };
  med: { max: BN; tip: BN };
  fast: { max: BN; tip: BN };
  baseFeePerGas: BN;
  pendingBlockNumber: number;
  pendingBlockTimestamp: number;
}> {
  return await keepTrying(async () => {
    const chain = network(chainId);
    const pending = chain.pendingBlocks ? "pending" : "latest";
    const [pendingBlock, history] = await Promise.all([
      web3!.eth.getBlock(pending),
      !!web3!.eth.getFeeHistory
        ? web3!.eth.getFeeHistory(length, pending, percentiles)
        : Promise.resolve({ reward: [] }),
    ]);

    const baseFeePerGas = BN.max(
      pendingBlock.baseFeePerGas?.toString() || 0,
      chain.baseGasPrice,
      0
    );

    const slow = BN.max(
      1,
      median(_.map(history.reward, (r) => BN(r[0].toString(), 16)))
    );
    const med = BN.max(
      1,
      median(_.map(history.reward, (r) => BN(r[1].toString(), 16)))
    );
    const fast = BN.max(
      1,
      median(_.map(history.reward, (r) => BN(r[2].toString(), 16)))
    );

    return {
      slow: {
        max: baseFeePerGas.times(1).plus(slow).integerValue(),
        tip: slow.integerValue(),
      },
      med: {
        max: baseFeePerGas.times(1.1).plus(med).integerValue(),
        tip: med.integerValue(),
      },
      fast: {
        max: baseFeePerGas.times(1.25).plus(fast).integerValue(),
        tip: fast.integerValue(),
      },
      baseFeePerGas,
      pendingBlockNumber: BN(pendingBlock.number.toString()).toNumber(),
      pendingBlockTimestamp: BN(pendingBlock.timestamp.toString()).toNumber(),
    };
  });
}

export function network(chainId: number) {
  return _.find(networks, (n) => n.id === chainId)!;
}

export function median(arr: BN.Value[]): BN {
  if (!arr.length) return zero;

  arr = [...arr].sort((a, b) => bn(a).comparedTo(b));
  const midIndex = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0
    ? bn(arr[midIndex])
    : bn(arr[midIndex - 1])
        .plus(arr[midIndex])
        .div(2);
}

export async function keepTrying<T>(
  fn: () => Promise<T>,
  retries = 3,
  ms = 1000
): Promise<T> {
  let e;
  for (let i = 0; i < retries; i++) {
    try {
      return await timeout(fn, ms);
    } catch (_e) {
      e = _e;
      await sleep(ms);
    }
  }
  throw new Error("failed to invoke fn " + e);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function timeout<T>(fn: () => Promise<T>, ms = 1000): Promise<T> {
  let failed = false;
  const r = await Promise.race([
    fn(),
    new Promise((resolve) => {
      setTimeout(() => {
        failed = true;
        resolve(null);
      }, ms);
    }),
  ]);
  if (!failed && !!r) return r as T;
  else throw new Error("timeout");
}

export function parsebn(n: BN.Value, defaultValue?: BN, fmt?: BN.Format): BN {
  if (typeof n !== "string") return bn(n);

  const decimalSeparator = fmt?.decimalSeparator || ".";
  const str = n.replace(new RegExp(`[^${decimalSeparator}\\d-]+`, "g"), "");
  const result = bn(
    decimalSeparator === "." ? str : str.replace(decimalSeparator, ".")
  );
  if (defaultValue && (!result.isFinite() || result.lte(zero)))
    return defaultValue;
  else return result;
}

export const getBaseAssets = (chainId: number) => {
  switch (chainId) {
    case supportedChains.polygon.chainId:
      return [
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
        "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7",
        "0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff",
      ];
    case supportedChains.bsc.chainId:
      return [
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        "0x55d398326f99059fF775485246999027B3197955",
        "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        "0xeBd49b26169e1b52c04cFd19FCf289405dF55F80",
      ];
    case supportedChains.zkEvm.chainId:
      return [];
    case supportedChains.base.chainId:
      return [
        "0x4200000000000000000000000000000000000006",
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      ];
    default:
      return [];
  }
};

export const findTokenInList = (tokens: Token[], addressOrSymbol: string) => {
  const res = tokens.find(
    (t) =>
      eqIgnoreCase(t.address, addressOrSymbol) || t.symbol === addressOrSymbol
  );
  return res;
};

export const filterTokens = (list?: Token[], filterValue?: string): Token[] => {
  if (!filterValue) return list || [];

  if (!list) return [];

  return list.filter((it) => {
    return (
      it.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 ||
      eqIgnoreCase(it.address, filterValue)
    );
  });
};

export function fetchWithTimeout(
  func: () => Promise<Response>,
  timeout: number
) {
  return Promise.race([
    func(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
}

export const formatNumberDecimals = (
  decimalScale = 3,
  value?: string | number
) => {
  const maxZero = 5;

  if (!value) return 0;
  const [, decimal] = value.toString().split(".");
  if (!decimal) return 0;
  const arr = decimal.split("");
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === "0") {
      count++;
    } else {
      break;
    }
  }
  if (count > maxZero) return 0;
  return !count ? decimalScale : count + decimalScale;
};

export const formatNumber = (
  value?: string | number,
  decimalScale?: number
) => {
  return numericFormatter(value?.toString() || "", {
    decimalScale: formatNumberDecimals(decimalScale, value),
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
  });
};

export const Logger = (value: string | object | any[] | number) => {
  const debug = useLiquidityHubPersistedStore.getState().debug;

  if (debug) {
    try {
      console.log("LH-> ", value);
    } catch (error) {}
  }
};


export const safeBN = (value?: string | number) => {
  if (!value) return
  return BN(value).decimalPlaces(0).toString()
}
export const getContract = (address?: string, web3?: Web3, chainId?: number) => {
  if (!address || !web3 || !address.startsWith("0x") || !chainId) return undefined;
  const wethAddress = getChainConfig(chainId)?.wToken?.address
  return new web3.eth.Contract(
    isNativeAddress(address) ? iwethabi : (erc20abi as any),
    isNativeAddress(address) ? wethAddress : address
  );
}