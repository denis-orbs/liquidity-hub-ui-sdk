import { useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  useChainConfig,
  usePriceChanged,
  SwapConfirmation,
  useFormatNumber,
  useAmountUI,
} from "../lib";
import { Button } from "../lib/components/Button";
import { useWidgetContext } from "./context";
import { usePriceUsd, useRefreshBalancesAfterTx } from "./hooks";
import { WidgetModal } from "./Modal";
import BN from "bignumber.js";
import { Text } from "../lib/components/Text";
import { isNativeAddress } from "@defi.org/web3-candies";

export const SwapConfirmationModal = () => {
  const {
    swapStatus,
    swapStep,
    isWrapped,
    quote,
    onSwapCallback,
    state: { initialQuote, fromAmount, fromToken, toToken, showConfirmation },
    updateState,
    onCloseConfirmation,
    hasAllowance,
  } = useWidgetContext();

  const outAmount = useAmountUI(toToken?.decimals, quote?.outAmount);
  const wToken = useChainConfig()?.wToken;
  const fromTokenUsdSN = usePriceUsd({ address: fromToken?.address }).data;
  const toTokenUsdSN = usePriceUsd({ address: toToken?.address }).data;

  const fromTokenUsd = useMemo(() => {
    return BN(fromTokenUsdSN || 0)
      .multipliedBy(fromAmount || 0)
      .toString();
  }, [fromTokenUsdSN, fromAmount]);

  const toTokenUsd = useMemo(() => {
    return BN(toTokenUsdSN || 0)
      .multipliedBy(outAmount || 0)
      .toString();
  }, [toTokenUsdSN, outAmount]);

  const onWrapSuccess = useCallback(() => {
    updateState({ fromToken: wToken });
  }, [updateState, wToken]);

  const refetchBalances = useRefreshBalancesAfterTx();
  const resetDexState = useWidgetContext().resetState;

  const onClick = useCallback(async () => {
    try {
      await onSwapCallback();
      refetchBalances();
    } catch (error) {
      console.log(error);
    }
  }, [onSwapCallback, refetchBalances]);

  const closeModal = useCallback(() => {
    if (swapStatus === "success") {
      resetDexState();
    }

    if (swapStatus === "failed" && isWrapped) {
      onWrapSuccess();
    }
    onCloseConfirmation();
  }, [
    resetDexState,
    swapStatus,
    onWrapSuccess,
    isWrapped,
    onCloseConfirmation,
  ]);

  // const modalTitle = useMemo(() => {
  //   return getSwapModalTitle(swapStatus);
  // }, [swapStatus]);

  const swapButtonContent = useMemo(() => {
    if (isNativeAddress(fromToken?.address || "")) return "Wrap and Swap";
    if (!hasAllowance) return "Approve and Swap";
    return "Sign and Swap";
  }, [fromToken, hasAllowance]);
  const newPrice = useFormatNumber({
    value: useAmountUI(toToken?.decimals, quote?.outAmount),
  });

  const priceChangeWarning = usePriceChanged({
    quote,
    initialQuote,
    isOpen: showConfirmation,
    swapStatus,
  });

  return (
    <WidgetModal open={!!showConfirmation} onClose={closeModal}>
      {priceChangeWarning.shouldAccept ? (
        <AcceptAmountOut
          amountToAccept={newPrice}
          accept={priceChangeWarning.acceptChanges}
        />
      ) : (
        <SwapConfirmation
          fromTokenUsd={fromTokenUsd}
          toTokenUsd={toTokenUsd}
          outAmount={outAmount}
          fromAmount={fromAmount}
          fromToken={fromToken}
          toToken={toToken}
          swapStatus={swapStatus}
          swapStep={swapStep}
          hasAllowance={hasAllowance}
          SubmitButton={
            <Button onClick={onClick} isLoading={false}>
              {swapButtonContent}
            </Button>
          }
        />
      )}
    </WidgetModal>
  );
};

const AcceptAmountOut = ({
  amountToAccept,
  accept,
}: {
  amountToAccept?: string;
  accept: () => void;
}) => {
  const amount = useFormatNumber({
    value: amountToAccept,
  });

  return (
    <StyledAcceptAmountOut>
      <Text>Price updated</Text>
      <Text>new amount out is {amount}</Text>
      <Button onClick={accept}>Accept</Button>
    </StyledAcceptAmountOut>
  );
};

const StyledAcceptAmountOut = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
  width: 100%;
  button {
    width: 100%;
  }
`;
