import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { useTokenListBalance } from "./useTokenListBalance";
import { useTokenListBalances } from "./useTokenListBalances";
import { useIsInvalidChain } from "./useIsInvalidChain";
import { useWidgetContext } from "../context";
import {
  getChainConfig,
  useAmountBN,
  useAmountUI,
  useChainConfig,
  useUnwrapCallback,
  useWrapCallback,
} from "../../lib";
import { useMutation } from "@tanstack/react-query";
import { useSwitchNetwork } from "./useSwitchNetwork";
import { useMainContext } from "../../lib/context/MainContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWrapOrUnwrapOnly } from "../../lib/hooks/hooks";
import { useWidgetQuote } from "./useWidgetQuote";

export const useUnwrap = () => {
  const { refetch } = useTokenListBalances();
  const {
    state: { fromAmountUi, fromToken },
  } = useWidgetContext();
  const amount = useAmountBN(fromToken?.decimals, fromAmountUi);

  const unwrapCallback = useUnwrapCallback();
  return useMutation({
    mutationFn: async () => {
      if (!amount || BN(amount).isZero()) {
        throw new Error("No amount to wrap");
      }
      return unwrapCallback(amount);
    },
    onSuccess: () => {
      refetch();
    },
  });
};

export const useWrap = () => {
  const { refetch } = useTokenListBalances();
  const {
    state: { fromAmountUi, fromToken },
  } = useWidgetContext();

  const wrapMF = useWrapCallback();
  const amount = useAmountBN(fromToken?.decimals, fromAmountUi);

  return useMutation({
    mutationFn: async () => {
      if (!amount || BN(amount).isZero()) {
        throw new Error("No amount to wrap");
      }
      await refetch();
      return wrapMF(amount);
    },
  });
};

export const useShowConfirmationButton = () => {
  const {quote, isLoading: quoteLoading, isError: quoteError } = useWidgetQuote();
  const {
    state: { fromAmountUi, fromToken, toToken },
    updateState
  } = useWidgetContext();
  const outAmountUi = useAmountUI(toToken?.decimals, quote?.outAmount);
  const fromAmount = useAmountBN(fromToken?.decimals, fromAmountUi);

  const onShowConfirmation = useCallback(
    () => {
      updateState({showConfirmation: true, initialQuote: quote})
    },
    [updateState, quote],
  )
  

  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();

  const { balance: fromTokenBalance } = useTokenListBalance(fromToken?.address);

  const wToken = useChainConfig()?.wToken?.address;
  const { mutate: unwrap, isPending: unwrapLoading } = useUnwrap();
  const { mutate: wrap, isPending: wrapLoading } = useWrap();
  const { openConnectModal } = useConnectModal();

  const { account, supportedChains } = useMainContext();

  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    fromToken?.address,
    toToken?.address
  );

  const isLoading =
    quoteLoading || switchNetworkLoading || unwrapLoading || wrapLoading;

  return useMemo(() => {
    if (quoteLoading) {
      return {
        disabled: false,
        text: "",
        quoteLoading: true,
        isLoading,
      };
    }

    if (!account) {
      return {
        disabled: false,
        text: "Connect Wallet",
        onClick: openConnectModal,
      };
    }

    if (wrongChain) {
      return {
        disabled: false,
        text: `Switch to ${getChainConfig(supportedChains?.[0])?.name}`,
        onClick: () => switchNetwork?.(supportedChains?.[0]!),
        switchNetworkLoading,
        isLoading,
      };
    }

    if (!fromToken || !toToken) {
      return {
        disabled: true,
        text: "Select tokens",
      };
    }

    if (BN(fromAmount || 0).isZero() && BN(outAmountUi || 0).isZero()) {
      return {
        disabled: true,
        text: "Enter an amount",
      };
    }

    if (isWrapOnly) {
      return {
        disabled: false,
        text: "Wrap",
        onClick: wrap,
        isLoading,
      };
    }

    if (isUnwrapOnly) {
      return {
        disabled: false,
        text: "Unwrap",
        onClick: unwrap,
        uwrapLoading: unwrapLoading,
        isLoading: unwrapLoading,
      };
    }

    if (!quote?.outAmount) {
      return {
        disabled: false,
        text: "",
        quoteLoading: true,
        isLoading: true,
      };
    }

    if (BN(fromAmount || 0).gt(fromTokenBalance || 0)) {
      return {
        disabled: true,
        text: "Insufficient balance",
      };
    }

    if (quoteError || BN(outAmountUi || "0").isZero()) {
      return {
        disabled: true,
        text: "No liquidity",
      };
    }

    return {
      disabled: false,
      text: "Swap",
      onClick: onShowConfirmation,
    };
  }, [
    wrongChain,
    fromToken,
    toToken,
    fromAmount,
    outAmountUi,
    fromTokenBalance,
    switchNetwork,
    switchNetworkLoading,
    isLoading,
    account,
    supportedChains,
    wToken,
    unwrap,
    unwrapLoading,
    quoteError,
    outAmountUi,
    quoteLoading,
    quote?.outAmount,
    isUnwrapOnly,
    isWrapOnly,
    wrap,
    onShowConfirmation,
    openConnectModal,
  ]);
};
