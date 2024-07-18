import BN from "bignumber.js";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTokenListBalance } from "./useTokenListBalance";
import { useTokenListBalances } from "./useTokenListBalances";
import { useSwitchNetwork, useUnwrap } from "../..";
import { useAmountBN, useChainConfig, useQuote } from "../../hooks";
import { useDexState } from "../../store/dex";
import { getChainConfig } from "../../util";
import { useIsInvalidChain } from "./useIsInvalidChain";
import { useWrapOrUnwrapOnly } from "../../hooks/hooks";
import { useWrap } from "../../hooks/useWrap";
import { useMainContext } from "../../context/MainContext";

export const useUnwrapMF = () => {
  const { refetch } = useTokenListBalances();
  const { fromAmount, fromToken } = useDexState(
    useShallow((s) => ({
      fromAmount: s.fromAmount,
      fromToken: s.fromToken,
    }))
  );
  const amount = useAmountBN(fromToken?.decimals, fromAmount);

  const unwrapMF = useUnwrap();
  return {
    ...unwrapMF,
    mutate: () => {
      return unwrapMF.mutate({ fromAmount: amount, onSuccess: refetch });
    },
  };
};

export const useWrapMF = () => {
  const { refetch } = useTokenListBalances();
  const { fromAmount, fromToken } = useDexState(
    useShallow((s) => ({
      fromAmount: s.fromAmount,
      fromToken: s.fromToken,
    }))
  );

  const wrapMF = useWrap();
  const amount = useAmountBN(fromToken?.decimals, fromAmount);
  return {
    ...wrapMF,
    mutate: () => {
      return wrapMF.mutate({
        fromTokenAddress: fromToken?.address,
        fromAmount: amount,
        onSuccess: refetch,
      });
    },
  };
};

export const useShowConfirmationButton = (props: {
  quoteQuery: ReturnType<typeof useQuote>;
  onClick: () => void;
}) => {
  const {
    quoteQuery: { quote, isLoading: quoteLoading, error: quoteError },
    onClick,
  } = props;
  const { fromAmount, fromToken, toToken } = useDexState();
  const outAmountUi = quote?.amountOutUI;

  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();

  const { balance: fromTokenBalance } = useTokenListBalance(fromToken?.address);

  const wToken = useChainConfig()?.wToken?.address;
  const { mutate: unwrap, isPending: unwrapLoading } = useUnwrapMF();
  const { mutate: wrap, isPending: wrapLoading } = useWrapMF();

  const { connectWallet, account, supportedChains } = useMainContext();

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
        onClick: connectWallet,
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
      onClick: onClick,
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
    connectWallet,
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
    onClick,
  ]);
};
