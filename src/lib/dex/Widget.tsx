import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  TokenPanelProps,
  WidgetConfig,
  TokenListItemProps,
  ProviderArgs,
  Token,
  LiquidityHubPayload,
} from "../type";
import {
  StyledChangeTokens,
  StyledContainer,
  StyledInput,
  StyledPercentButtons,
  StyledTokenPanel,
  StyledTokenPanelContent,
  StyledTokenSelect,
  StyledTop,
} from "../styles";
import { ArrowDown } from "react-feather";
import styled, { ThemeProvider } from "styled-components";
import { Spinner } from "../components/Spinner";
import { TokenList } from "../components/TokenList";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { LoadingText } from "../components/LoadingText";
import { TokenSearchInput } from "../components/SearchInput";
import { useShallow } from "zustand/react/shallow";
import BN from "bignumber.js";
import {
  useAcceptedAmountOut,
  useFormatNumber,
  useLiquidityHub,
} from "../hooks";
import { Text } from "../components/Text";
import { Logo } from "../components/Logo";
import { PoweredByOrbs, SwapConfirmation } from "../components";
import { FlexRow, FlexColumn } from "../base-styles";
import { useTokenListBalance } from "./hooks/useTokenListBalance";
import { LiquidityHubProvider, useMainContext } from "../provider";
import { useDexState } from "../store/dex";
import {
  usePercentSelect,
  useShowConfirmationButton,
  useDexLH,
  useSelectToken,
  useInputChange,
} from "./hooks";
import _ from "lodash";
import { useOnSwapSuccessCallback } from "./hooks/useOnSwapSuccessCallback";
import { useInitialTokens } from "./hooks/useInitialTokens";
import { ConfirmationPoweredBy } from "../components/SwapConfirmation/ConfirmationPoweredBy";
import { useGasCostUsd, usePriceImpact } from "../hooks/useSwapDetails";

export const theme = {
  colors: {
    button: "linear-gradient(180deg,#448aff,#004ce6)",
    buttonDisabled: "linear-gradient(180deg, #252833, #1d212c)",
    primary: "#448aff",
    pageBackground: "#12141B",
    modalBackground: "#12131a",
    textMain: "#c7cad9",
    buttonText: "white",
    buttonDisabledText: "#c7cad9",
    card: "#232734",
    borderMain: "rgba(255, 255, 255, 0.07)",
    textSecondary: "white",
  },
};

interface ContenxtType extends WidgetConfig {
  UIconfig?: WidgetConfig;
}

const Context = createContext({} as ContenxtType);

const useWidgetContext = () => {
  return useContext(Context);
};

interface ContextProps {
  children: ReactNode;
  UIconfig?: WidgetConfig;
}

const ContextProvider = (props: ContextProps) => {
  return (
    <Context.Provider
      value={{
        UIconfig: props.UIconfig,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

const WidgetModal = ({
  children,
  open,
  onClose,
  title,
}: {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title?: string;
}) => {
  const modal = useWidgetContext().UIconfig?.modalStyles;

  return (
    <Modal
      title={title || ""}
      containerStyles={modal?.containerStyles}
      bodyStyles={modal?.bodyStyles}
      open={open}
      onClose={onClose}
    >
      {children}
    </Modal>
  );
};

const defaultPercentButtons = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const PercentButtons = () => {
  const onPercentageChange = usePercentSelect();
  const percentButtons =
    useWidgetContext().UIconfig?.layout?.tokenPanel?.percentButtons ||
    defaultPercentButtons;
  return (
    <StyledPercentButtons className="lh-percent-container">
      {percentButtons?.map((it, index) => {
        return (
          <button key={index} onClick={() => onPercentageChange(it.value)}>
            {it.label}
          </button>
        );
      })}
    </StyledPercentButtons>
  );
};

const TokenSelect = ({
  symbol,
  logoUrl,
  onSelect,
}: {
  symbol?: string;
  logoUrl?: string;
  onSelect: (token: Token) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const onTokenSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
  };
  return (
    <>
      <StyledTokenSelect
        $selected={!!symbol}
        onClick={() => setOpen(true)}
        className={`lh-token-select ${
          symbol ? "lh-token-select-selected" : ""
        }`}
      >
        {logoUrl && <Logo src={logoUrl} className="lh-token-logo" />}
        <Text className="lh-token-symbol">{symbol || "Select token"}</Text>
      </StyledTokenSelect>
      <WidgetModal
        title="Select token"
        open={open}
        onClose={() => setOpen(false)}
      >
        <TokenSearchInput value={filterValue} setValue={setFilterValue} />
        <StyledTokenListContainer>
          <TokenList
            ListLabel={TokenListLabel}
            filter={filterValue}
            onTokenSelect={onTokenSelect}
            ListItem={TokenListItem}
          />
        </StyledTokenListContainer>
      </WidgetModal>
    </>
  );
};

const SwapModal = (props: ReturnType<typeof useLiquidityHub>) => {
  const {
    quote,
    btnText,
    swapCallback,
    isLoading,
    swapStatus,
    onCloseConfirmation,
    showConfirmation,
    toToken,
    title,
  } = props;

  const { accept, shouldAccept, amountToAccept } = useAcceptedAmountOut(
    quote?.outAmount,
    quote?.minAmountOut,
    toToken
  );

  const onSuccess = useOnSwapSuccessCallback();

  const TryAgainButton = () => {
    return (
      <StyledSubmitButton onClick={onCloseConfirmation}>
        Try again
      </StyledSubmitButton>
    );
  };

  const onClick = useCallback(async () => {
    try {
      await swapCallback();
      onSuccess();
    } catch (error) {}
  }, [swapCallback, onSuccess]);

  return (
    <WidgetModal
      title={title}
      open={showConfirmation}
      onClose={onCloseConfirmation}
    >
      {shouldAccept ? (
        <AcceptAmountOut amountToAccept={amountToAccept} accept={accept} />
      ) : (
        <SwapConfirmation {...props} >
          {swapStatus === "failed" ? (
            <TryAgainButton />
          ) : (
            !swapStatus && (
              <>
                <SwapDetails {...props} />
                <StyledSubmitButton onClick={onClick} isLoading={isLoading}>
                  {btnText}
                </StyledSubmitButton>
              </>
            )
          )}
        </SwapConfirmation>
      )}
      <ConfirmationPoweredBy />
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

const StyledPoweredByOrbs = styled(PoweredByOrbs)`
  margin-top: 30px;
`;

export const SwapSubmitButton = (props: LiquidityHubPayload) => {
  const { disabled, text, onClick, isLoading } = useShowConfirmationButton(props);

  return (
    <StyledSubmitButton
      className={`lh-swap-button`}
      $disabled={disabled}
      disabled={disabled}
      onClick={() => onClick?.()}
    >
      <p style={{ opacity: isLoading ? 0 : 1 }}>{text}</p>
      {isLoading ? (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      ) : null}
    </StyledSubmitButton>
  );
};

const SpinnerContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledSubmitButton = styled(Button)<{ $disabled?: boolean }>`
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "unset")};
  font-size: 16px;
  width: 100%;
  border: unset;
  font-weight: 600;
  margin-top: 20px;
  min-height: 52px;
  border-radius: 10px;
  position: relative;
  cursor: ${({ $disabled }) => ($disabled ? "unset" : "pointer")};
  background: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.buttonDisabled : theme.colors.button};
  color: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.buttonDisabledText : theme.colors.buttonText};
`;

const Container = ({ children }: { children: React.ReactNode }) => {
  const styles = useWidgetContext().UIconfig?.styles;

  return <StyledContainer $style={styles}>{children}</StyledContainer>;
};

const ChangeTokens = () => {
  const swapTokens = useDexState((s) => s.onSwitchTokens);
  return (
    <StyledChangeTokens className="lh-switch-tokens">
      <button onClick={swapTokens}>
        <ArrowDown />
      </button>
    </StyledChangeTokens>
  );
};

const FromTokenPanel = (props: LiquidityHubPayload) => {
  const { fromToken, fromAmountUi, inTokenUsdAmount } = props;
  
  const select = useSelectToken(true);
  const onChange = useInputChange()
  return (
    <TokenPanel
      token={fromToken}
      inputValue={fromAmountUi || ""}
      onInputChange={onChange}
      label="From"
      isSrc={true}
      onTokenSelect={select}
      usd={inTokenUsdAmount?.toString()}
    />
  );
};

const ToTokenPanel = (props: LiquidityHubPayload) => {
  const { toToken, quote, outTokenUsdAmount } = props
  const select = useSelectToken(false)
  return (
    <TokenPanel
      onTokenSelect={select}
      token={toToken}
      inputValue={quote?.ui.outAmount}
      label="To"
      usd={outTokenUsdAmount}
    />
  );
};

const TokenPanelHeader = ({
  isSrc,
  label,
}: {
  isSrc?: boolean;
  label?: string;
}) => {
  return (
    <StyledTop className="lh-token-panel-header">
      <Text className="lh-token-panel-label">{label}</Text>
      {isSrc && <PercentButtons />}
    </StyledTop>
  );
};

const TokenPanel = ({
  inputValue,
  onInputChange,
  token,
  label,
  isSrc,
  onTokenSelect,
  usd: _usd,
}: TokenPanelProps) => {
  const UIconfig = useWidgetContext();
  const account = useMainContext().account;
  const tokenPanelLayout = UIconfig?.layout?.tokenPanel;

  const headerOutside = tokenPanelLayout?.headerOutside;
  const inputLeft = tokenPanelLayout?.inputSide === "left";
  const usdLeft = tokenPanelLayout?.usdSide === "left";
  const { balance: _balance, isLoading: balanceLoading } = useTokenListBalance(
    token?.address
  );
  const balance = useFormatNumber({
    value: _balance,
  });

  const fetchingBalancesAfterTx = useDexState(
    useShallow((s) => s.fetchingBalancesAfterTx)
  );

  const usd = useFormatNumber({ value: _usd });

  const header = <TokenPanelHeader isSrc={isSrc} label={label} />;
    const usdLoading = BN(usd || '0').isZero() && BN(inputValue || '0').gt(0);
  return (
    <StyledTokenPanel
      $inputLeft={inputLeft}
      $usdLeft={usdLeft}
      className="lh-token-panel-container"
    >
      {headerOutside && header}
      <StyledTokenPanelContent className="lh-token-panel-container-content">
        {!headerOutside && header}
        <FlexRow style={{ width: "100%", gap: 12 }}>
          <>
            <StyledInput
              onChange={onInputChange}
              value={inputValue}
              placeholder="0.00"
              $alignLeft={inputLeft}
              disabled={!isSrc}
            />
            <TokenSelect
              symbol={token?.symbol}
              logoUrl={token?.logoUrl}
              onSelect={onTokenSelect}
            />
          </>
        </FlexRow>
        <FlexRow
          style={{
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {account && (
            <Balance
              value={`Balance: ${balance || "0"}`}
              isLoading={balanceLoading || fetchingBalancesAfterTx}
              css={{
                opacity: !token ? 0 : 1,
              }}
            />
          )}
          <USD value={`$ ${usd || "0"}`} isLoading={usdLoading} />
        </FlexRow>
      </StyledTokenPanelContent>
    </StyledTokenPanel>
  );
};

const USD = styled(LoadingText)`
  height: 13px;
  text-align: right;
  margin-left: auto;
`;

const Balance = styled(LoadingText)`
  height: 13px;
`;

export interface Props extends ProviderArgs {
  UIconfig?: WidgetConfig;
  initialFromToken?: string;
  initialToToken?: string;
}

export const Widget = (props: Props) => {
  const { UIconfig, ...rest } = props;

  return (
    <LiquidityHubProvider {...rest}>
      <ThemeProvider theme={theme}>
        <ContextProvider UIconfig={props.UIconfig}>
          <Watcher {...props} />
          <WidgetContent />
        </ContextProvider>
      </ThemeProvider>
    </LiquidityHubProvider>
  );
};

const WidgetContent = () => {

  const lh = useDexLH();
  return (
    <Container>
      <FromTokenPanel {...lh} />
      <ChangeTokens />
      <ToTokenPanel {...lh} />
      <SwapDetails {...lh}  />
      <SwapSubmitButton {...lh} />
      <SwapModal {...lh} />
      <StyledPoweredByOrbs />
    </Container>
  );
};

const Watcher = (props: Props) => {
  useInitialTokens(props.initialFromToken, props.initialToToken);
  return null;
};

export const TokenListItem = (props: TokenListItemProps) => {
  const balance = useFormatNumber({ value: props.balance });
  const usd = useFormatNumber({ value: props.usd });

  return (
    <StyledListToken $disabled={props.selected}>
      <FlexRow
        style={{
          width: "unset",
          flex: 1,
          justifyContent: "flex-start",
          gap: 10,
        }}
      >
        <Logo
          className="logo"
          src={props.token.logoUrl}
          alt={props.token.symbol}
          imgStyle={{
            width: 30,
            height: 30,
          }}
        />
        <FlexColumn style={{ alignItems: "flex-start" }}>
          <Text className="symbol">{props.token.symbol}</Text>
          {props.token.name && (
            <StyledTokenName className="name">
              {props.token.name}
            </StyledTokenName>
          )}
        </FlexColumn>
      </FlexRow>
      <FlexColumn
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <StyledBalance isLoading={props.balanceLoading} value={balance} />
        {usd && <StyledUsd value={`$ ${usd}`} />}
      </FlexColumn>
    </StyledListToken>
  );
};

const TokenListLabel = ({ text }: { text: string }) => {
  return <StyledTokenListLabel>{text}</StyledTokenListLabel>;
};

const StyledUsd = styled(LoadingText)`
  font-size: 12px;
  opacity: 0.8;
`;

const StyledTokenName = styled(Text)`
  font-size: 12px;
  opacity: 0.8;
`;

const StyledBalance = styled(LoadingText)`
  font-size: 14px;
`;

export const StyledTokenListLabel = styled.div`
  padding: 0px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

export const StyledListToken = styled.div<{ $disabled?: boolean }>(
  ({ $disabled }) => ({
    cursor: "pointer",
    display: "flex",
    gap: 10,
    height: "100%",
    alignItems: "center",
    padding: "0px 20px",
    transition: "0.2s all",
    width: "100%",
    opacity: $disabled ? 0.5 : 1,
    pointerEvents: $disabled ? "none" : "all",
    "&:hover": {
      background: "rgba(255,255,255, 0.07)",
    },
  })
);

const StyledTokenListContainer = styled(FlexColumn)`
  color: white;
  max-height: 50vh;
  height: 500px;
  width: 100%;
`;

const SwapDetails = (props: LiquidityHubPayload) => {
  const priceImpactF = useFormatNumber({
    value: usePriceImpact(),
    decimalScale: 2,
  });
  const {quote, toToken, fromAmountUi: fromAmount} = props;
  const minAmountOut = useFormatNumber({ value: quote?.ui.minAmountOut });

  const gasCostUsd = useGasCostUsd();
  const gas = useFormatNumber({ value: gasCostUsd, decimalScale: 2 });
  // const rateUsd = useFormatNumber({
  //   value: rate.usd,
  //   decimalScale: 2,
  //   prefix: "$",
  // });


  if (BN(fromAmount || "0").isZero() || BN(quote?.outAmount || "0").isZero())
    return null;

  return (
    <StyledSwapDetails>
      {/* <StyledDetailsRow onClick={rate.invert}>
        <StyledDetailsRowLabel>Rate</StyledDetailsRowLabel>
        <StyledDetailsRowValue>
          {`1 ${rate.leftToken} = ${rate.rightToken} ${rate.value}`}{" "}
          <small>{`(${rateUsd})`}</small>
        </StyledDetailsRowValue>
      </StyledDetailsRow> */}
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
