import BN from "bignumber.js";
import Web3 from "web3";
import { useGlobalStore } from "../store/main";
import { OriginalQuote } from "../type";
import { amountUi, Logger, waitForTxReceipt } from "../util";

import { AnalyticsData, InitDexTrade, InitTrade } from "./types";
const ANALYTICS_VERSION = 0.6;
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
    Logger(`Error on wallet`);
  }
};

const initSwap = (args: InitTrade): Partial<AnalyticsData> | undefined => {
  const srcToken = args.fromToken;
  const dstToken = args.toToken;
  if (!srcToken || !dstToken) {
    return;
  }

  let srcTokenUsdValue = args.fromTokenUsdAmount
    ? parseFloat(args.fromTokenUsdAmount)
    : 0;
  let dstTokenUsdValue = args.toTokenUsdAmount
    ? parseFloat(args.toTokenUsdAmount)
    : 0;

  const clobDexPriceDiffPercent = !args.dexAmountOut
    ? "0"
    : new BN(args.quoteAmountOut || "0")
        .dividedBy(new BN(args.dexAmountOut))
        .minus(1)
        .multipliedBy(100)
        .toFixed(2);

  let quoteAmountOutUI = amountUi(
    dstToken.decimals,
    new BN(args.quoteAmountOut || "0")
  );

  const wallet = onWallet(args.provider) || {};
  return {
    clobDexPriceDiffPercent,
    dexOutAmountWS: args.dexOutAmountWS || "0",
    dexOutAmountWSUi: amountUi(
      dstToken.decimals,
      new BN(args.dexOutAmountWS || "0")
    ),
    dexAmountOut: args.dexAmountOut || "0",
    dexAmountOutUi: amountUi(
      dstToken.decimals,
      new BN(args.dexAmountOut || "0")
    ),
    srcTokenUsdValue,
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
    ...wallet,
  };
};

const sendBI = async (data: Partial<AnalyticsData>) => {
  try {
    Logger(data)
    await fetch(BI_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    Logger(`Analytics error: ${error}`);
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

  onQuoteSuccess(quoteMillis: number, quoteResponse: OriginalQuote) {
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
    quoteResponse?: OriginalQuote
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

  onSwapFailed(error: string, time: number) {
    this.updateAndSend({
      swapError: error,
      swapState: "failed",
      swapMillis: time,
  
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
