import BN from "bignumber.js";
import Web3 from "web3";
import { useGlobalStore } from "../store/main";
import { QuoteResponse } from "../type";
import { amountUi, waitForTxReceipt } from "../util";

import { AnalyticsData, InitDexTrade, InitTrade } from "./types";
const ANALYTICS_VERSION = 0.5;
const BI_ENDPOINT = `https://bi.orbs.network/putes/liquidity-hub-ui-${ANALYTICS_VERSION}`;
const DEX_PRICE_BETTER_ERROR = "Dex trade is better than Clob trade";

const initialData: Partial<AnalyticsData> = {
  _id: crypto.randomUUID(),
  isClobTrade: false,
  quoteIndex: 0,
  isForceClob: false,
  isDexTrade: false,
  version: ANALYTICS_VERSION,
};


const onWallet = (provider: any): Partial<AnalyticsData | undefined> => {
  try {
    const walletConnectName = (provider as any)?.session?.peer.metadata.name;

    if (provider.isRabby) {
      return { walletConnectName, isRabby: true };
    }
    if (provider.isWalletConnect) {
      return { walletConnectName, isWalletConnect: true };
    }
    if (provider.isCoinbaseWallet) {
      return { walletConnectName, isCoinbaseWallet: true };
    }
    if (provider.isOkxWallet) {
      return { walletConnectName, isOkxWallet: true };
    }
    if (provider.isTrustWallet) {
      return { walletConnectName, isTrustWallet: true };
    }
    if (provider.isMetaMask) {
      return { walletConnectName, isMetaMask: true };
    }
  } catch (error) {
    console.log("Error on wallet", error);
  }
};



const initSwap = (args: InitTrade): Partial<AnalyticsData> | undefined => {
  const srcToken = args.fromToken;
  const dstToken = args.toToken;
  if (!srcToken || !dstToken) {
    return;
  }

  const outAmount = args.dexMinAmountOut || args.quoteAmountOut;
  let dstTokenUsdValue = 0;
  try {
    dstTokenUsdValue = new BN(outAmount || "0")
      .multipliedBy(BN(args.toTokenUsd || "0"))
      .dividedBy(new BN(10).pow(new BN(dstToken?.decimals || 0)))
      .toNumber();
  } catch (error) {
    console.log(error);
  }

  let srcTokenUsdValue = amountUi(
    args.fromToken?.decimals,
    BN(args.srcAmount || "0").multipliedBy(BN(args.fromTokenUsd || "0"))
  );

  const clobDexPriceDiffPercent = !args.dexMinAmountOut
    ? "0"
    : new BN(args.quoteAmountOut || "0")
        .dividedBy(new BN(args.dexMinAmountOut))
        .minus(1)
        .multipliedBy(100)
        .toFixed(2);

  let quoteAmountOutUI = amountUi(
    dstToken.decimals,
    new BN(args.quoteAmountOut || "0")
  );
  const quoteAmountOutUsd = BN(quoteAmountOutUI || "0")
    .multipliedBy(BN(args.toTokenUsd || "0"))
    .toNumber();
    const wallet = onWallet(args.provider) || {}
  return {
    clobDexPriceDiffPercent,
    dexMinAmountOut: args.dexMinAmountOut || "0",
    dexMinAmountOutUI: amountUi(
      dstToken.decimals,
      new BN(args.dexMinAmountOut || "0")
    ),
    dexExpectedAmountOut: args.dexExpectedAmountOut || "0",
    dexExpectedAmountOutUI: amountUi(
      dstToken.decimals,
      new BN(args.dexExpectedAmountOut || "0")
    ),

    dexAmountOut: args.dexMinAmountOut || "0",
    srcTokenUsdValue: srcTokenUsdValue ? Number(srcTokenUsdValue) : 0,
    dstTokenUsdValue,
    srcTokenAddress: srcToken?.address,
    srcTokenSymbol: srcToken?.symbol,
    dstTokenAddress: dstToken?.address,
    dstTokenSymbol: dstToken?.symbol,
    srcAmountUI: args.srcAmount
      ? amountUi(srcToken.decimals, new BN(args.srcAmount))
      : args.srcAmountUI,
    srcAmount: args.srcAmount,
    slippage: args.slippage,
    walletAddress: args.walletAddress,
    tradeType: args.tradeType,
    quoteAmountOut: args.quoteAmountOut,
    quoteAmountOutUI,
    quoteAmountOutUsd,
    ...wallet
  };
};

const sendBI = async (data: Partial<AnalyticsData>) => {
  try {
    await fetch(BI_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log("Analytics error", error);
  }
};

export class Analytics {
  initialTimestamp = Date.now();
  data = {} as Partial<AnalyticsData>;
  firstFailureSessionId = "";
  timeout: any = undefined;
  setPartner(partner: string) {
    this.data.partner = partner;
  }

  setChainId(chainId: number) {
    this.data.chainId = chainId;
  }

  public async updateAndSend(values = {} as Partial<AnalyticsData>) {
    const chainId = values.chainId || this.data.chainId;
    const partner = values.partner || this.data.partner;
    if (!chainId || !partner) {
      console.error("Missng chain or partner");
      return;
    }
    this.data = {
      ...this.data,
      ...values,
      sessionId: useGlobalStore.getState().sessionId,
    };
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      sendBI(this.data);
    }, 1_000);
  }

  onInitSwap(args: InitTrade) {
    if (!this.data.chainId) return;
    const result = initSwap(args);
    this.updateAndSend(result);
  }

  onQuoteRequest() {
    this.data = {
      ...this.data,
      quoteState: "pending",
      quoteIndex: !this.data.quoteIndex ? 1 : this.data.quoteIndex + 1,
    };
  }

  onQuoteSuccess(quoteMillis: number, quoteResponse: QuoteResponse) {
    this.data = {
      ...this.data,
      quoteState: "success",
      quoteMillis,
      quoteError: undefined,
      isNotClobTradeReason: undefined,
      quoteAmountOut: quoteResponse?.outAmount,
      quoteSerializedOrder: quoteResponse?.serializedOrder,
    };
  }

  onQuoteFailed(
    error: string,
    quoteMillis: number,
    quoteResponse?: QuoteResponse
  ) {
    // we not treat DEX_PRICE_BETTER_ERROR as a failure
    if (error == DEX_PRICE_BETTER_ERROR) {
      this.data = {
        ...this.data,
        isNotClobTradeReason: DEX_PRICE_BETTER_ERROR,
        quoteState: "success",
        quoteMillis,
        quoteAmountOut: quoteResponse?.outAmount,
        quoteSerializedOrder: quoteResponse?.serializedOrder,
      };
    } else {
      this.data = {
        ...this.data,
        quoteError: error,
        quoteState: "failed",
        isNotClobTradeReason: `quote-failed`,
        quoteMillis,
        quoteAmountOut: quoteResponse?.outAmount,
        quoteSerializedOrder: quoteResponse?.serializedOrder,
      };
    }
  }

  onApprovedBeforeTheTrade() {
    this.updateAndSend({
      userWasApprovedBeforeTheTrade: true,
    });
  }

  onApprovalRequest() {
    this.updateAndSend({ approvalState: "pending" });
  }

  onApprovalSuccess(time: number) {
    this.updateAndSend({ approvalMillis: time, approvalState: "success" });
  }

  onApprovalFailed(error: string, time: number) {
    this.updateAndSend({
      approvalError: error,
      approvalState: "failed",
      approvalMillis: time,
      isNotClobTradeReason: "approval failed",
    });
  }

  onSignatureRequest() {
    this.updateAndSend({ signatureState: "pending" });
  }

  onWrapRequest() {
    this.updateAndSend({ wrapState: "pending" });
  }

  onWrapSuccess(time: number) {
    this.updateAndSend({
      wrapMillis: time,
      wrapState: "success",
    });
  }

  onWrapFailed(error: string, time: number) {
    this.updateAndSend({
      wrapError: error,
      wrapState: "failed",
      wrapMillis: time,
      isNotClobTradeReason: "wrap failed",
    });
  }

  onSignatureSuccess(signature: string, time: number) {
    this.updateAndSend({
      signature,
      signatureMillis: time,
      signatureState: "success",
    });
  }

  onSignatureFailed(error: string, time: number) {
    this.updateAndSend({
      signatureError: error,
      signatureState: "failed",
      signatureMillis: time,
      isNotClobTradeReason: "signature failed",
    });
  }

  onSwapRequest() {
    this.updateAndSend({ swapState: "pending" });
  }

  onSwapSuccess(txHash: string, time: number) {
    this.updateAndSend({
      txHash,
      swapMillis: time,
      swapState: "success",
      isClobTrade: true,
      onChainClobSwapState: "pending",
    });
  }

  onSwapFailed(error: string, time: number, onChainFailure: boolean) {
    this.updateAndSend({
      swapError: error,
      swapState: "failed",
      swapMillis: time,
      isNotClobTradeReason: onChainFailure
        ? "onchain swap error"
        : "swap failed",
      onChainClobSwapState: onChainFailure ? "failed" : "null",
    });
  }

  clearState() {
    setTimeout(() => {
      this.data = {
        ...initialData,
        partner: this.data.partner,
        chainId: this.data.chainId,
        _id: crypto.randomUUID(),
        firstFailureSessionId: this.firstFailureSessionId,
      };
    }, 1_000);
  }

  async onClobOnChainSwapSuccess() {
    this.updateAndSend({ onChainClobSwapState: "success" });
  }

  onNotClobTrade(message: string) {
    this.updateAndSend({ isNotClobTradeReason: message });
  }

  onClobFailure() {
    this.firstFailureSessionId =
      this.firstFailureSessionId || this.data.sessionId || "";
  }
}

const _analytics = new Analytics();

function onDexSwapRequest() {
  _analytics.updateAndSend({ dexSwapState: "pending", isDexTrade: true });
}

async function onDexSwapSuccess(web3: Web3, dexSwapTxHash?: string) {
  _analytics.updateAndSend({
    dexSwapState: "success",
    dexSwapTxHash,
  });
  if (!dexSwapTxHash) return;
  const res = await waitForTxReceipt(web3, dexSwapTxHash);

  _analytics.updateAndSend({
    onChainDexSwapState: res?.mined ? "success" : "failed",
  });
}
function onDexSwapFailed(dexSwapError: string) {
  _analytics.updateAndSend({ dexSwapState: "failed", dexSwapError });
}

const initDexSwap = (args: InitDexTrade) => {
  const result = initSwap(args);
  _analytics.updateAndSend({
    ...result,
    partner: args.partner,
    chainId: args.chainId,
  });
};

// for dex
export const analytics = {
  onSwapRequest: onDexSwapRequest,
  onSwapSuccess: onDexSwapSuccess,
  onSwapFailed: onDexSwapFailed,
  initSwap: initDexSwap,
};

export const swapAnalytics = new Analytics();
