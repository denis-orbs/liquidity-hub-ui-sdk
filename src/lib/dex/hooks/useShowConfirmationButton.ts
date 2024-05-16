import BN from "bignumber.js";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import { useTokenListBalance } from "./useTokenListBalance";
import { useTokenListBalances } from "./useTokenListBalances";
import { LiquidityHubPayload, useSwitchNetwork, useUnwrap } from "../..";
import { useIsInvalidChain, useChainConfig } from "../../hooks";
import { useMainContext } from "../../provider";
import { useDexState } from "../../store/dex";
import {
  amountBN,
  getChainConfig,
  eqIgnoreCase,
  isNativeAddress,
} from "../../util";
import { useAmountBN } from "../../hooks/useAmountBN";

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

export const useShowConfirmationButton = (args: LiquidityHubPayload) => {

  const {onShowConfirmation, quote, fromAmount, fromToken, toToken, analyticsInit, quoteLoading, quoteError} = args


  const toAmount = quote?.ui.outAmount;
  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();
  
  const fromAmountBN = new BN(fromAmount || "0");
  const { balance: fromTokenBalance } = useTokenListBalance(fromToken?.address);
  
  const fromTokenBalanceBN = useAmountBN(fromToken?.decimals, fromTokenBalance)
  const wToken = useChainConfig()?.wToken?.address;
  const { mutate: unwrap, isPending: unwrapLoading } = useUnwrapMF();
  const { connectWallet, account, supportedChains } = useMainContext();
  

  const _confirmSwap = useCallback(() => {
    analyticsInit();
    onShowConfirmation();
  }, [onShowConfirmation, analyticsInit]);

  const isLoading = quoteLoading || switchNetworkLoading || unwrapLoading;

  return useMemo(() => {
    if (quoteLoading) {
      return {
        disabled: false,
        text: "",
        quoteLoading:true,
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
        text: `Switch to ${getChainConfig(supportedChains[0])?.chainName}`,
        onClick: () => switchNetwork?.(supportedChains[0]!),
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

    if (BN(fromAmount || 0).isZero() && BN(toAmount || 0).isZero()) {
      return {
        disabled: true,
        text: "Enter an amount",
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

    if (fromAmountBN.gt(fromTokenBalanceBN || '0')) {
      return {
        disabled: true,
        text: "Insufficient balance",
      };
    }

    if (quoteError || BN(toAmount || "0").isZero()) {
      return {
        disabled: true,
        text: "No liquidity",
      };
    }

    return {
      disabled: false,
      text: "Swap",
      onClick: _confirmSwap,
    };
  }, [
    wrongChain,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fromTokenBalance,
    quote,
    switchNetwork,
    switchNetworkLoading,
    _confirmSwap,
    isLoading,
    account,
    connectWallet,
    supportedChains,
    wToken,
    unwrap,
    unwrapLoading,

  ]);
};
