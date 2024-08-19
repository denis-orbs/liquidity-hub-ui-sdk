import { useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  SwapConfirmation,
  useAmountUI,
  Quote,
  SwapStatus,
  useSwapState,
  useFormatNumber,
} from "../lib";
import { Button } from "../lib/components/Button";
import { useWidgetContext } from "./context";
import { usePriceUsd, useRefreshBalancesAfterTx } from "./hooks";
import { WidgetModal } from "./Modal";
import BN from "bignumber.js";
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
    state: { fromAmountUi, fromToken, toToken, showConfirmation, txHash },
    updateState,
    hasAllowance,
    chainConfig,
    resetState,
  
  } = useWidgetContext();
  const {
    isWrappedNativeToken,
    swapStatus,
    swapStep,
    acceptedQuote,
    onAcceptedQuote,
  } = useSwapState();
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
      resetState();
    }
    if (swapStatus === SwapStatus.FAILED && isWrappedNativeToken) {
      onWrapSuccess();
    }
    onCloseConfirmation();
  }, [
    resetDexState,
    swapStatus,
    onWrapSuccess,
    isWrappedNativeToken,
    onCloseConfirmation,
    resetState,
  ]);

  const swapButtonContent = useMemo(() => {
    if (isNativeAddress(fromToken?.address || "")) return "Wrap and Swap";
    if (!hasAllowance) return "Approve and Swap";
    return "Sign and Swap";
  }, [fromToken, hasAllowance]);

  const refetchQuote = useCallback(async () => {
    try {
      const quote = await widgetQuote.refetch().then((res) => res.data);
      onAcceptedQuote(quote);
    } catch (error) {}
  }, [widgetQuote.refetch, onAcceptedQuote]);


  const fromUsd = useFromUsd();
  const toUsd = useToUsd(acceptedQuote);
  const outAmount = useAmountUI(toToken?.decimals, acceptedQuote?.outAmount);

  return (
    <WidgetModal open={!!showConfirmation} onClose={closeModal}>
      <StyledSwapConfirmation
        fromUsd={fromUsd}
        toUsd={toUsd}
        outAmount={useFormatNumber({value: outAmount, decimalScale: 3})}
        inAmount={useFormatNumber({value: fromAmountUi, decimalScale: 3})}
        fromToken={fromToken}
        toToken={toToken}
        txHash={txHash}
        swapStatus={swapStatus}
        swapStep={swapStep}
        refetchQuote={refetchQuote}
        hasAllowance={hasAllowance}>
          <StyledSubmitButton onClick={onClick} isLoading={false}>
            {swapButtonContent}
          </StyledSubmitButton>
        </StyledSwapConfirmation>
    </WidgetModal>
  );
};

const StyledSwapConfirmation = styled(SwapConfirmation)({
  color:'white'
})

const StyledSubmitButton = styled(Button)`
  width: 100%;
  margin-top: 20px;

`;
