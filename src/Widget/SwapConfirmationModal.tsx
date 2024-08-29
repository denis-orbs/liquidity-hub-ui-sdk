import { useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  SwapConfirmation,
  useAmountUI,
  Quote,
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
    hasAllowance,
    resetState,
  } = useWidgetContext();
  const {
    swapStatus,
    swapStep,
    acceptedQuote,
  } = useSwapState();
  const { mutateAsync: onSwapCallback } = useWidgetSwapCallback();

  const refetchBalances = useRefreshBalancesAfterTx();
  const onClick = useCallback(async () => {
    try {
      await onSwapCallback();
      refetchBalances();
    } catch (error) {
      console.log(error);
    }
  }, [onSwapCallback, refetchBalances]);

  const closeModal = useCallback(() => {
    resetState();
  }, [resetState]);

  const swapButtonContent = useMemo(() => {
    if (isNativeAddress(fromToken?.address || "")) return "Wrap and Swap";
    if (!hasAllowance) return "Approve and Swap";
    return "Sign and Swap";
  }, [fromToken, hasAllowance]);


  const fromUsd = useFromUsd();
  const toUsd = useToUsd(acceptedQuote);
  const outAmount = useAmountUI(toToken?.decimals, acceptedQuote?.outAmount);

  return (
    <WidgetModal open={!!showConfirmation} onClose={closeModal}>
      <StyledSwapConfirmation
        fromUsd={fromUsd}
        toUsd={toUsd}
        outAmount={useFormatNumber({ value: outAmount, decimalScale: 3 })}
        inAmount={useFormatNumber({ value: fromAmountUi, decimalScale: 3 })}
        fromToken={fromToken}
        toToken={toToken}
        txHash={txHash}
        swapStatus={swapStatus}
        swapStep={swapStep}
        hasAllowance={hasAllowance}
        counters= {{
          swap: 60_000,
          signature: 30_000
        }}
      >
        <StyledSubmitButton onClick={onClick} isLoading={false}>
          {swapButtonContent}
        </StyledSubmitButton>
      </StyledSwapConfirmation>
    </WidgetModal>
  );
};


const StyledSwapConfirmation = styled(SwapConfirmation)({
  color: "white",
});

const StyledSubmitButton = styled(Button)`
  width: 100%;
  margin-top: 20px;
`;
