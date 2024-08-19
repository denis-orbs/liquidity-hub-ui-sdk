import { useMemo } from "react";
import styled from "styled-components";
import { useAmountUI, useFormatNumber } from "../lib";
import { FlexColumn } from "../lib/base-styles";
import { useWidgetContext } from "./context";
import { usePriceUsd, usePriceImpact, useRate } from "./hooks";
import BN from "bignumber.js";
import { Text } from "../lib/components/Text";
import { useWidgetQuote } from "./hooks/useWidgetQuote";

export const SwapDetails = () => {
  const {
    state: { fromToken, toToken, fromAmountUi },
  } = useWidgetContext();
  const quote = useWidgetQuote().data;

  const minAmountOut = useFormatNumber({
    value: useAmountUI(toToken?.decimals, quote?.minAmountOut),
  });
  const gasCost = useAmountUI(toToken?.decimals, quote?.gasAmountOut);

  const usd = usePriceUsd({ address: toToken?.address }).data;
  const gasCostUsd = useMemo(() => {
    if (!gasCost || !usd) return "0";
    return BN(gasCost).times(usd).toString();
  }, [gasCost, usd]);
  const gas = useFormatNumber({ value: gasCostUsd, decimalScale: 2 });

  const inTokenUsd = usePriceUsd({ address: fromToken?.address }).data;
  const outTokenUsd = usePriceUsd({ address: toToken?.address }).data;

  const priceImpactF = useFormatNumber({
    value: usePriceImpact(inTokenUsd, outTokenUsd, quote?.outAmount),
    decimalScale: 2,
  });

  const rate = useRate(inTokenUsd, outTokenUsd);
  const rateUsd = useFormatNumber({
    value: rate.usd,
    decimalScale: 2,
    prefix: "$",
  });

  if (BN(fromAmountUi || "0").isZero() || BN(quote?.outAmount || "0").isZero())
    return null;

  return (
    <StyledSwapDetails>
      <StyledDetailsRow onClick={rate.invert}>
        <StyledDetailsRowLabel>Rate</StyledDetailsRowLabel>
        <StyledDetailsRowValue>
          {`1 ${rate.leftToken} = ${rate.rightToken} ${rate.value}`}{" "}
          <small>{`(${rateUsd})`}</small>
        </StyledDetailsRowValue>
      </StyledDetailsRow>
      <StyledDetailsRow>
        <StyledDetailsRowLabel>Gas cost</StyledDetailsRowLabel>
        <StyledDetailsRowValue>{`$${gas}`}</StyledDetailsRowValue>
      </StyledDetailsRow>
      <StyledDetailsRow>
        <StyledDetailsRowLabel>Min amount out</StyledDetailsRowLabel>

        <StyledDetailsRowValue>{`${minAmountOut} ${toToken?.symbol}`}</StyledDetailsRowValue>
      </StyledDetailsRow>
      <StyledDetailsRow>
        <StyledDetailsRowLabel>Price impact</StyledDetailsRowLabel>

        <StyledDetailsRowValue>{`${
          priceImpactF ? `${priceImpactF}%` : "-"
        }`}</StyledDetailsRowValue>
      </StyledDetailsRow>
    </StyledSwapDetails>
  );
};

const StyledSwapDetails = styled(FlexColumn)`
  gap: 12px;
  margin-bottom: 20px;
  margin-top: 20px;
  width: 100%;
`;

const StyledDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledDetailsRowLabel = styled(Text)`
  font-size: 14px;
  font-weight: 500;
`;

const StyledDetailsRowValue = styled(Text)`
  font-size: 14px;
  small {
    opacity: 0.5;
  }
`;
