export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
