import  { useCallback, useMemo } from "react";
import { ArrowDown } from "react-feather";
import { ThemeProvider } from "styled-components";
import BN from "bignumber.js";
import _ from "lodash";
import { TokenPanel } from "./components/TokenPanel";
import { useWidgetContext, WidgetProvider } from "./context";
import {
  PoweredByOrbs,
  useFormatNumber,
} from "../lib";
import {
  useFromTokenPanel,
  usePriceUsd,
  useToTokenPanel,
} from "./hooks";
import { StyledChangeTokens, StyledContainer, theme } from "./styles";
import { useWrapOrUnwrapOnly } from "../lib/hooks/hooks";
import { SwapDetails } from "./SwapDetails";
import { SwapSubmitButton } from "./SubmitButton";
import { SwapConfirmationModal } from "./SwapConfirmationModal";

const ChangeTokens = () => {
  const {
    state: { fromToken, toToken },
    updateState,
  } = useWidgetContext();

  const swapTokens = useCallback(() => {
    updateState({
      fromToken: toToken,
      toToken: fromToken,
    });
  }, [updateState, fromToken, toToken]);

  return (
    <StyledChangeTokens className="lh-switch-tokens">
      <button onClick={swapTokens}>
        <ArrowDown />
      </button>
    </StyledChangeTokens>
  );
};

const FromTokenPanel = () => {
  const { token, amount, onChange, onTokenSelect } = useFromTokenPanel();

  const { data: usdSingleToken, isLoading } = usePriceUsd({
    address: token?.address,
  });

  const usd = useMemo(() => {
    if (!usdSingleToken || !amount) return "0";
    return BN(usdSingleToken || 0)
      .times(amount || "0")
      .toString();
  }, [usdSingleToken, amount]);

  return (
    <TokenPanel
      token={token}
      inputValue={amount || ""}
      onInputChange={onChange}
      label="From"
      isSrc={true}
      onTokenSelect={onTokenSelect}
      usd={usd}
      usdLoading={isLoading}
    />
  );
};

const ToTokenPanel = ({ outAmountUi }: { outAmountUi?: string }) => {
  const { fromToken, toToken, fromAmount } = useWidgetContext().state;
  const { token, onTokenSelect } = useToTokenPanel();
  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    fromToken?.address,
    toToken?.address
  );

  const { data: usdSingleToken, isLoading } = usePriceUsd({
    address: token?.address,
  });

  const outAmount = isUnwrapOnly || isWrapOnly ? fromAmount : outAmountUi;

  const usd = useMemo(() => {
    if (!usdSingleToken || !outAmount) return "0";
    return BN(outAmount || 0)
      .times(usdSingleToken || "0")
      .toString();
  }, [usdSingleToken, outAmount]);

  return (
    <TokenPanel
      onTokenSelect={onTokenSelect}
      token={token}
      inputValue={useFormatNumber({ value: outAmount })}
      label="To"
      usd={usd}
      usdLoading={isLoading}
    />
  );
};

export interface Props {
  initialFromToken?: string;
  initialToToken?: string;
  slippage?: number;
}

export const Widget = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <WidgetProvider {...props}>
        <StyledContainer>
          <FromTokenPanel />
          <ChangeTokens />
          <ToTokenPanel />
          <SwapDetails />
          <SwapSubmitButton />
          <SwapConfirmationModal />
          <PoweredByOrbs />
        </StyledContainer>
      </WidgetProvider>
    </ThemeProvider>
  );
};
