import BN, { BigNumber } from "bignumber.js";
import Web3 from "web3";
import { LH_CONTROL, SwapStatus } from "./type";
import _ from "lodash";
import { QUOTE_ERRORS } from "./config/consts";
import { numericFormatter } from "react-number-format";
import { useLiquidityHubPersistedStore } from "./store/main";
import erc20abi from "./abi/ERC20Abi.json";
import iwethabi from "./abi/IWETHAbi.json";
import { isNativeAddress, networks, parsebn } from "@defi.org/web3-candies";

export const amountBN = (decimals?: number, amount?: string) =>
  parsebn(amount || "")
    .times(new BN(10).pow(decimals || 0))
    .decimalPlaces(0);

export const amountUi = (decimals?: number, amount?: BN | string) => {
  if (!amount) return "";
  const percision = new BN(10).pow(decimals || 0);
  return BN(amount).times(percision).idiv(percision).div(percision).toString();
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getApiUrl = (chainId: number) => {
  switch (chainId) {
    case networks.poly.id:
      return "https://polygon.hub.orbs.network";
    case networks.bsc.id:
      return "https://bsc.hub.orbs.network";
    case networks.ftm.id:
      return "https://ftm.hub.orbs.network";
    case networks.base.id:
      return "https://base.hub.orbs.network";
    case networks.linea.id:
      return "https://linea.hub.orbs.network";
    case networks.blast.id:
      return "https://blast.hub.orbs.network";
    case networks.zkevm.id:
      return "https://zkevm.hub.orbs.network";

    default:
      return "https://hub.orbs.network";
  }
};

export const getChainConfig = (chainId?: number) => {
  if (!chainId) return undefined;
  const result = Object.values(networks).find((it) => it.id === chainId);
  if (!result) return undefined;
  const localStorageApiUrl = localStorage.getItem("apiUrl");
  return {
    ...result,
    apiUrl: localStorageApiUrl ||  getApiUrl(chainId),
  };
};

export const getTxReceipt = async (web3: Web3, txHash: string) => {
  const res = await waitForTxDetails(web3, txHash);
  if (!res?.mined) {
    throw new Error(res?.revertMessage);
  }

  return {
    receipt: res?.receipt,
    txHash,
  };
};


async function waitForTxDetails(web3: Web3, txHash: string) {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const { mined, revertMessage, receipt } = await getTransactionDetails(
        web3,
        txHash
      );

      if (mined) {
        return {
          mined,
          revertMessage: undefined,
          receipt,
        };
      }
      if (revertMessage) {
        return {
          mined: false,
          revertMessage,
          receipt,
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
): Promise<{ mined: boolean; revertMessage?: string; receipt?: any }> {
  let receipt;
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
      receipt,
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
  if (!value) return;
  return BN(value).decimalPlaces(0).toFixed();
};
export const getContract = (
  address?: string,
  web3?: Web3,
  chainId?: number
) => {
  if (!address || !web3 || !address.startsWith("0x") || !chainId)
    return undefined;
  const wethAddress = getChainConfig(chainId)?.wToken?.address;

  return new web3.eth.Contract(
    isNativeAddress(address) ? iwethabi : (erc20abi as any),
    isNativeAddress(address) ? wethAddress : address
  );
};

export const isTxRejected = (message?: string) => {
  return (
    message?.toLowerCase()?.includes("rejected") ||
    message?.toLowerCase()?.includes("denied")
  );
};
export const isNativeBalanceError = (message?: string) => {
  return (
    message?.toLowerCase()?.includes("insufficient") ||
    message?.toLowerCase()?.includes("gas required exceeds allowance")
  );
};

export const getSwapModalTitle = (swapStatus: SwapStatus) => {
  if (swapStatus === SwapStatus.FAILED) return;
  if (swapStatus === SwapStatus.SUCCESS) return "Swap Successfull";
  return "Review Swap";
};

export const isLHSwap = (lhAmountOut?: string, dexAmountOut?: string) => {
  if (useLiquidityHubPersistedStore.getState().lhControl === LH_CONTROL.FORCE) {
    return true;
  }

  return BN(lhAmountOut || 0).gt(dexAmountOut || 0);
};

export async function waitForReceipt({
  web3,
  txHash,
  delay: dellayMillis = 3_000,
  attempts = 20,
}: {
  web3: Web3;
  txHash: string;
  delay?: number;
  attempts?: number;
}) {
  for (let i = 0; i < attempts; ++i) {
    await delay(dellayMillis);
    try {
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        return receipt;
      }
    } catch (error: any) {
      console.error("waitForReceipt error", error);
    }
  }
}
