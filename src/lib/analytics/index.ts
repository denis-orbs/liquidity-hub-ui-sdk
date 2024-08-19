import BN from "bignumber.js";
import { Quote, Token } from "../type";
import { amountUi, Logger } from "../util";

import { AnalyticsData, InitTrade } from "./types";
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

type QuoteArgs = {
  fromToken: Token;
  toToken: Token;
  wTokenAddress: string;
  fromAmount: string;
  apiUrl: string;
  dexMinAmountOut?: string;
  account?: string;
  partner: string;
  sessionId?: string;
  slippage: number;
  quoteInterval?: number;
  chainId: number;
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
    sessionId: args.sessionId,
    ...wallet,
  };
};

const sendBI = async (data: Partial<AnalyticsData>) => {
  try {
    Logger(data);
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

  constructor() {
    this.updateAndSend({ moduleLoaded: true });
  }

  setPartner(partner: string) {
    this.data.partner = partner;
  }

  setChainId(chainId: number) {
    this.data.chainId = chainId;
  }

  public async updateAndSend(values = {} as Partial<AnalyticsData>) {
    this.data = {
      ...this.data,
      ...values,
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

  onQuoteRequest(args: QuoteArgs) {
    const dexMinAmountOutUi = amountUi(
      args.toToken.decimals,
      args.dexMinAmountOut
    );

    const getDexOutAmountWS = () => {
      const slippageAmount = !args.slippage
        ? 0
        : BN(args.dexMinAmountOut || "0").times(args.slippage / 100);
      return BN(args.dexMinAmountOut || "0")
        .plus(slippageAmount)
        .toString();
    };

    const dexMinAmountOutWS = getDexOutAmountWS();
    const dexMinAmountOutWSUi = amountUi(
      args.toToken.decimals,
      dexMinAmountOutWS
    );

    this.data = {
      ...this.data,
      quoteState: "pending",
      quoteIndex: !this.data.quoteIndex ? 1 : this.data.quoteIndex + 1,
      srcTokenAddress: args.fromToken.address,
      srcTokenSymbol: args.fromToken.symbol,
      dstTokenAddress: args.toToken.address,
      dstTokenSymbol: args.toToken.symbol,
      chainId: args.chainId,
      slippage: args.slippage,
      walletAddress: args.account,
      dexAmountOut: args.dexMinAmountOut,
      dexAmountOutUi: dexMinAmountOutUi,
      dexOutAmountWS: dexMinAmountOutWS,
      dexOutAmountWSUi: dexMinAmountOutWSUi,
      srcAmount: args.fromAmount,
      srcAmountUI: amountUi(args.fromToken.decimals, args.fromAmount),
    };
  }

  onQuoteSuccess(quoteMillis: number, quote: Quote, args: QuoteArgs) {
    const clobDexPriceDiffPercent = !args.dexMinAmountOut
      ? "0"
      : new BN(quote.minAmountOut || "0")
          .dividedBy(new BN(args.dexMinAmountOut))
          .minus(1)
          .multipliedBy(100)
          .toFixed(2);

    this.data = {
      ...this.data,
      quoteState: "success",
      quoteMillis,
      quoteError: undefined,
      isNotClobTradeReason: undefined,
      quoteAmountOut: quote?.outAmount,
      quoteAmountOutUI: amountUi(
        args.toToken.decimals,
        new BN(quote.outAmount || "0")
      ),
      quoteSerializedOrder: quote?.serializedOrder,
      quoteMinAmountOut: quote?.minAmountOut,
      quoteMinAmountOutUI: amountUi(args.toToken.decimals, quote.minAmountOut),
      clobDexPriceDiffPercent,
      sessionId: quote.sessionId,
    };
  }

  onQuoteFailed(error: string, quoteMillis: number) {
    // we not treat DEX_PRICE_BETTER_ERROR as a failure
    if (error == DEX_PRICE_BETTER_ERROR) {
      this.data = {
        ...this.data,
        isNotClobTradeReason: DEX_PRICE_BETTER_ERROR,
        quoteState: "success",
        quoteMillis,
      };
    } else {
      this.data = {
        ...this.data,
        quoteError: error,
        quoteState: "failed",
        isNotClobTradeReason: `quote-failed`,
        quoteMillis,
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

export const swapAnalytics = new Analytics();
