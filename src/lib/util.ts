import {  Quote } from "./type";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCryptoAmount(amount?: string, decimals?: number) {
  if (!amount || !decimals) return "0";
  const adjustedAmount = Number(amount) / Math.pow(10, decimals);
  return adjustedAmount.toFixed();
}


export const getApiUrl = (chainId: number) => {
  switch (chainId) {
    case 137:
      return "https://polygon.hub.orbs.network";
    case 56:
      return "https://bsc.hub.orbs.network";
    case 250:
      return "https://ftm.hub.orbs.network";
    case 8453:
      return "https://base.hub.orbs.network";
    case 59144:
      return "https://linea.hub.orbs.network";
    case 81457:
      return "https://blast.hub.orbs.network";
    case 1101:
      return "https://zkevm.hub.orbs.network";

    default:
      return "https://hub.orbs.network";
  }
};

type TxDetailsFromApi = any;
export const getTxDetailsFromApi = async (
  txHash: string,
  chainId: number,
  quote?: Quote
): Promise<TxDetailsFromApi | undefined> => {
  const apiUrl = getApiUrl(chainId);
  for (let i = 0; i < 10; ++i) {
    await delay(2_500);
    try {
      const response = await fetch(
        `${apiUrl}/tx/${txHash}?chainId=${chainId}`,
        {
          method: "POST",
          body: JSON.stringify({
            outToken: quote?.outToken,
            user: quote?.user,
            qs: quote?.qs,
            partner: quote?.partner,
            sessionId: quote?.sessionId,
          }),
        }
      );

      const result = await response?.json();

      if (result && result.status?.toLowerCase() === "mined") {
        return result;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};


export const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};



export const Logger = (value: string | object | any[] | number) => {
  const debug = localStorage.getItem("debug")

  if (debug) {
    try {
      console.log("LH-> ", value);
    } catch (error) {}
  }
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

export class TimeoutError extends Error {
  constructor() {
    super();
    this.name = "TimeoutError";
    this.message = "Timeout error";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class RejectedError extends Error {
  constructor() {
    super();
    this.name = "Rejected";
    this.message = "Transaction rejected";

    Object.setPrototypeOf(this, RejectedError.prototype);
  }
}

export async function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  let timer: any;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new TimeoutError());
    }, timeout);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}
export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const nativeTokenAddresses = [
  zeroAddress,
  "0x0000000000000000000000000000000000001010",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x000000000000000000000000000000000000dEaD",
  "0x000000000000000000000000000000000000800A",
];

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}

export const isNativeAddress = (address: string) =>
  !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address));
