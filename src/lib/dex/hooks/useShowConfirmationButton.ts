import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import { useTokenListBalance } from "./useTokenListBalance";
import { useTokenListBalances } from "./useTokenListBalances";
import { LiquidityHubPayload, useSwitchNetwork, useUnwrap } from "../..";
import { useChainConfig } from "../../hooks";
import { useMainContext } from "../../provider";
import { useDexState } from "../../store/dex";
import {
  amountBN,
  getChainConfig,
  eqIgnoreCase,
  isNativeAddress,
} from "../../util";
import { useIsInvalidChain } from "./useIsInvalidChain";

export const useUnwrapMF = () => {
  const { refetch } = useTokenListBalances();
  const { fromAmount, fromToken } = useDexState(
    useShallow((s) => ({
      fromAmount: s.fromAmount,
      fromToken: s.fromToken,
    }))
  );

  const unwrap = useUnwrap();
  return useMutation({
    mutationFn: async () => {
      return unwrap(amountBN(fromToken?.decimals, fromAmount).toString());
    },
    onSuccess: () => {
      refetch();
    },
  });
};

export const useShowConfirmationButton = (props: LiquidityHubPayload) => {
  const { quote, quoteLoading, quoteError, analyticsInit, onShowConfirmation, fromToken, toToken, fromAmount, outAmountUi } = props;


  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();

  const { balance: fromTokenBalance } = useTokenListBalance(fromToken?.address);

  const wToken = useChainConfig()?.wToken?.address;
  const { mutate: unwrap, isPending: unwrapLoading } = useUnwrapMF();
  const { connectWallet, account, supportedChains } = useMainContext();

  const onSumbit = useCallback(() => {
    analyticsInit();
    onShowConfirmation();
  }, [onShowConfirmation, analyticsInit]);


  const isLoading = quoteLoading || switchNetworkLoading || unwrapLoading;

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

    if (!quote?.outAmount) {
      return {
        disabled: false,
        text: "",
        quoteLoading: true,
        isLoading: true,
      };
    }

    if(BN(fromAmount || 0).gt(fromTokenBalance || 0)) {
      return {
        disabled: true,
        text: "Insufficient balance",
      };
    }

    if (
      eqIgnoreCase(fromToken.address, wToken || "") &&
      isNativeAddress(toToken.address || "")
    ) {
      return {
        text: "Unwrap",
        onClick: unwrap,
        uwrapLoading: unwrapLoading,
        isLoading,
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
      onClick: onSumbit,
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
    onSumbit,
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
    quote?.outAmount
  ]);
};
