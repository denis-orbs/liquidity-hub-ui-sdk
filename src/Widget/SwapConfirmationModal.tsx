import { useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  usePriceChanged,
  SwapConfirmation,
  useFormatNumber,
  useAmountUI,
  Quote,
  SwapStatus,
} from "../lib";
import { Button } from "../lib/components/Button";
import { useWidgetContext } from "./context";
import { usePriceUsd, useRefreshBalancesAfterTx } from "./hooks";
import { WidgetModal } from "./Modal";
import BN from "bignumber.js";
import { Text } from "../lib/components/Text";
import { isNativeAddress } from "@defi.org/web3-candies";
import { useWidgetSwapCallback } from "./useWidgetSwapCallback";
import { useWidgetQuote } from "./hooks/useWidgetQuote";

const useFromUsd = () => {
  const {
    state: { fromAmountUi, fromToken },
  } = useWidgetContext();
  const fromTokenUsdSN = usePriceUsd({ address: fromToken?.address }).data;

  return useMemo(() => {
    return BN(fromTokenUsdSN || 0)
      .multipliedBy(fromAmountUi || 0)
      .toString();
  }, [fromTokenUsdSN, fromAmountUi]);
};

const useToUsd = (quote?: Quote) => {
  const {
    state: { toToken },
  } = useWidgetContext();
  const toTokenUsdSN = usePriceUsd({ address: toToken?.address }).data;
  const outAmount = useAmountUI(toToken?.decimals, quote?.outAmount);
  return useMemo(() => {
    return BN(toTokenUsdSN || 0)
      .multipliedBy(outAmount || 0)
      .toString();
  }, [toTokenUsdSN, outAmount]);
};

export const SwapConfirmationModal = () => {
  const {
    state: {
      initialQuote,
      fromAmountUi,
      fromToken,
      toToken,
      showConfirmation,
      swapStatus,
      swapStep,
      isWrapped,
    },
    updateState,
    hasAllowance,
    chainConfig,
  } = useWidgetContext();
  const { mutateAsync: onSwapCallback } = useWidgetSwapCallback();
  const widgetQuote = useWidgetQuote();

  const wToken = chainConfig?.wToken;

  const onCloseConfirmation = useCallback(() => {
    updateState({
      showConfirmation: false,
    });
  }, [updateState]);

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
    if (swapStatus === SwapStatus.SUCCESS || swapStatus === SwapStatus.FAILED) {
      resetDexState();
    }
    if (swapStatus === SwapStatus.FAILED && isWrapped) {
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

  const swapButtonContent = useMemo(() => {
    if (isNativeAddress(fromToken?.address || "")) return "Wrap and Swap";
    if (!hasAllowance) return "Approve and Swap";
    return "Sign and Swap";
  }, [fromToken, hasAllowance]);
  const newPrice = useFormatNumber({
    value: useAmountUI(toToken?.decimals, widgetQuote.quote?.outAmount),
  });

  const showPriceWarning = usePriceChanged(
    widgetQuote.quote?.minAmountOut,
    initialQuote?.minAmountOut
  );
  const onAcceptUpdatedPrice = useCallback(() => {
    updateState({ initialQuote: widgetQuote.quote });
  }, [widgetQuote.quote, updateState]);

  const displayQuote = !swapStatus ? widgetQuote.quote : initialQuote;

  const fromUsd = useFromUsd();
  const toUsd = useToUsd(displayQuote);
  const outAmount = useAmountUI(toToken?.decimals, initialQuote?.outAmount);

  return (
    <WidgetModal open={!!showConfirmation} onClose={closeModal}>
      {showPriceWarning && !swapStatus && showConfirmation ? (
        <AcceptAmountOut
          amountToAccept={newPrice}
          accept={onAcceptUpdatedPrice}
        />
      ) : (
        <SwapConfirmation
          fromUsd={fromUsd}
          toUsd={toUsd}
          outAmount={outAmount}
          fromAmount={fromAmountUi}
          fromToken={fromToken}
          toToken={toToken}
          swapStatus={swapStatus}
          swapStep={swapStep}
          hasAllowance={hasAllowance}
          SubmitButton={
            <StyledSubmitButton onClick={onClick} isLoading={false}>
              {swapButtonContent}
            </StyledSubmitButton>
          }
        />
      )}
    </WidgetModal>
  );
};

const StyledSubmitButton = styled(Button)`
  width: 100%;
  margin-top: 20px;
`;

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
