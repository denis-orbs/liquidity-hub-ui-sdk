import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  TokenPanelProps,
  WidgetConfig,
  TokenListItemProps,
  ProviderArgs,
  Token,
  QuoteResponse,
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
import { Button } from "../components/Button";
import { LoadingText } from "../components/LoadingText";
import { TokenSearchInput } from "../components/SearchInput";
import { useShallow } from "zustand/react/shallow";
import BN from "bignumber.js";
import {
  useAmountBN,
  useAmountUI,
  useChainConfig,
  useFormatNumber,
  useLiquidityHub,
  useSwapButtonContent,
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
  useFromTokenPanel,
  useToTokenPanel,
  useRate,
  usePriceUsd,
  usePriceImpact,
  useRefreshBalancesAfterTx,
} from "./hooks";
import _ from "lodash";
import { useInitialTokens } from "./hooks/useInitialTokens";
import {
  amountUiV2,
  getSwapModalTitle,
  getTxDetailsFromApi,
} from "../util";
import { useWrapOrUnwrapOnly } from "../hooks/hooks";

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

type ModalType = FC<{
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}>;

interface ContenxtType extends WidgetConfig {
  UIconfig?: WidgetConfig;
  Modal: ModalType;
  lhPayload: ReturnType<typeof useLiquidityHub>;
}

const Context = createContext({} as ContenxtType);

const useWidgetContext = () => {
  return useContext(Context);
};

interface ContextProps {
  children: ReactNode;
  UIconfig?: WidgetConfig;
  Modal: ModalType;
  slippage?: number;
}

const ContextProvider = (props: ContextProps) => {
  const store = useDexState();

  const fromAmount = useAmountBN(store.fromToken?.decimals, store.fromAmount);

  const lhPayload = useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount,
    debounceFromAmountMillis: 300,
    slippage: props.slippage || 0.5,
  });

  return (
    <Context.Provider
      value={{
        UIconfig: props.UIconfig,
        Modal: props.Modal,
        lhPayload,
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
  const Modal = useWidgetContext().Modal;
  return (
    <Modal title={title || ""} isOpen={open} onClose={onClose}>
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

const SwapModal = () => {
  const { lhPayload } = useWidgetContext();
  const {
    closeConfirmationModal,
    swapStatus,
    showConfirmationModal,
    submitSwap,
    swapLoading,
    fromToken,
    toToken,
    fromAmount,
    isWrapped,
    ui,
  } = lhPayload;

  const fromAmountUi = ui.fromAmount;
  const outAmountUi = ui.outAmount;
  const updateStore = useDexState(useShallow((s) => s.updateStore));

  const wToken = useChainConfig()?.wToken;
  const fromTokenUsdSN = usePriceUsd({ address: fromToken?.address }).data;
  const toTokenUsdSN = usePriceUsd({ address: toToken?.address }).data;

  const fromTokenUsd = useMemo(() => {
    return BN(fromTokenUsdSN || 0)
      .multipliedBy(fromAmountUi || 0)
      .toString();
  }, [fromTokenUsdSN, fromAmountUi]);

  const onWrapSuccess = useCallback(() => {
    updateStore({ fromToken: wToken });
  }, [updateStore, wToken]);
  const refetchBalances = useRefreshBalancesAfterTx();
  const resetDexState = useDexState((s) => s.onReserAfterSwap);
  const [exactOutAmount, setExactOutAmount] = useState<string | undefined>("");

  const TryAgainButton = () => {
    return (
      <StyledSubmitButton onClick={closeConfirmationModal}>
        Try again
      </StyledSubmitButton>
    );
  };

  const onClick = useCallback(async () => {
    try {
      const res = await submitSwap();
      setExactOutAmount(amountUiV2(toToken?.decimals, res.exactOutAmount));
      refetchBalances();
    } catch (error) {
      console.log(error);
    }
  }, [submitSwap, refetchBalances, toToken]);

  const closeModal = useCallback(() => {
    if (swapStatus === "success") {
      resetDexState();
    }

    if (swapStatus === "failed" && isWrapped) {
      onWrapSuccess();
    }

    closeConfirmationModal();
  }, [
    resetDexState,
    swapStatus,
    closeConfirmationModal,
    onWrapSuccess,
    isWrapped,
  ]);

  const modalTitle = useMemo(() => {
    return getSwapModalTitle(swapStatus);
  }, [swapStatus]);

  const swapButtonContent = useSwapButtonContent(
    fromToken?.address,
    fromAmount
  );

  const toAmount = exactOutAmount || outAmountUi;

  const toTokenUsd = useMemo(() => {
    return BN(toTokenUsdSN || 0)
      .multipliedBy(toAmount || 0)
      .toString();
  }, [toTokenUsdSN, toAmount]);

  return (
    <WidgetModal
      title={modalTitle}
      open={showConfirmationModal}
      onClose={closeModal}
    >
      <SwapConfirmation
        fromTokenUsd={fromTokenUsd}
        toTokenUsd={toTokenUsd}
        {...lhPayload}
        outAmount={toAmount}
      >
        {swapStatus === "success" ? (
          <SwapConfirmation.Success />
        ) : swapStatus === "failed" ? (
          <FlexColumn>
            <SwapConfirmation.Error />
            <TryAgainButton />
          </FlexColumn>
        ) : (
          <FlexColumn>
            <SwapConfirmation.Details />
            <SwapConfirmation.Steps />
            <SwapConfirmation.SubmitButton>
              <StyledSubmitButton
                onClick={onClick}
                isLoading={swapLoading}
                $disabled={swapLoading}
              >
                {swapButtonContent}
              </StyledSubmitButton>
            </SwapConfirmation.SubmitButton>
          </FlexColumn>
        )}
        <SwapConfirmation.PoweredBy />
      </SwapConfirmation>
    </WidgetModal>
  );
};


const StyledPoweredByOrbs = styled(PoweredByOrbs)`
  margin-top: 30px;
`;

export const SwapSubmitButton = () => {
  const lhPayload = useWidgetContext().lhPayload;

  const { disabled, text, onClick, isLoading } =
    useShowConfirmationButton(lhPayload);

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

const ToTokenPanel = () => {
  const { ui, fromToken, toToken } = useWidgetContext().lhPayload;
  const { token, onTokenSelect } = useToTokenPanel();
  const { isUnwrapOnly, isWrapOnly } = useWrapOrUnwrapOnly(
    fromToken?.address,
    toToken?.address
  );

  const { data: usdSingleToken, isLoading } = usePriceUsd({
    address: token?.address,
  });
  const fromAmountUi = ui?.fromAmount;
  const outAmountUi = ui?.outAmount;

  const outAmount = isUnwrapOnly || isWrapOnly ? fromAmountUi : outAmountUi;

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
  usdLoading,
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

  const balanceUi = useAmountUI(token?.decimals, _balance);
  const balance = useFormatNumber({
    value: balanceUi,
  });

  const fetchingBalancesAfterTx = useDexState(
    useShallow((s) => s.fetchingBalancesAfterTx)
  );

  const usd = useFormatNumber({ value: _usd });

  const header = <TokenPanelHeader isSrc={isSrc} label={label} />;

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
  Modal: ModalType;
  slippage?: number;
  chains?: number[];
}

export const Widget = (props: Props) => {
  const { UIconfig, Modal, ...rest } = props;

  return (
    <LiquidityHubProvider {...rest}>
      <ThemeProvider theme={theme}>
        <ContextProvider
          Modal={Modal}
          UIconfig={props.UIconfig}
          slippage={props.slippage}
        >
          <Watcher {...props} />
          <Container>
            <Button onClick={testFN}>Click</Button>
            <FromTokenPanel />
            <ChangeTokens />
            <ToTokenPanel />
            <SwapDetails />
            <SwapSubmitButton />
            <SwapModal />
            <StyledPoweredByOrbs />
          </Container>
        </ContextProvider>
      </ThemeProvider>
    </LiquidityHubProvider>
  );
};

const Watcher = (props: Props) => {
  useInitialTokens(props.initialFromToken, props.initialToToken);
  return null;
};

export const TokenListItem = (props: TokenListItemProps) => {
  const balanceUi = useAmountUI(props.token.decimals, props.balance);

  const balance = useFormatNumber({ value: balanceUi });
  const usdSingleToken = usePriceUsd({ address: props.token.address }).data;
  const usd = useFormatNumber({
    value: useMemo(() => {
      return BN(balanceUi || 0)
        .multipliedBy(usdSingleToken || 0)
        .toString();
    }, [balanceUi, usdSingleToken]),
  });

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

const SwapDetails = () => {
  const { quote, fromToken, toToken, fromAmount, ui } =
    useWidgetContext().lhPayload;
  const minAmountOut = useFormatNumber({ value: ui.outAmount });

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

  if (BN(fromAmount || "0").isZero() || BN(quote?.outAmount || "0").isZero())
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

const quote = {
  inToken: "0x55d398326f99059fF775485246999027B3197955",
  outToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  inAmount: "38849369874687187427",
  outAmount: "66140519978621861",
  user: "0x50015A452E644F5511fbeeac6B2aD2bf154E40E4",
  slippage: 0.5,
  qs: "",
  partner: "playground",
  exchange: "paraswap",
  sessionId: "680c1afc_56",
  serializedOrder:
    "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000066c6ed540000000000000000000000000000000000000000000000000000000066c6ed77000000000000000000000000120971cac17b63ffdadf862724925914b025a9e6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000055d398326f99059ff775485246999027b31979550000000000000000000000000000000000000000000000021b24b011787dd9e30000000000000000000000000000000000000000000000021b24b011787dd9e30000000000000000000000000000000000000000000000000000000000000200000000000000000000000000e9e78109c89162cef32bfe7cbcee1f31312fc1f600000000000000000000000050015a452e644f5511fbeeac6b2ad2bf154e40e40000000000000000000000000000000000000000000000000000000066c6ed4a0000000000000000000000000000000000000000000000000000000066c6edfe000000000000000000000000120971cac17b63ffdadf862724925914b025a9e600000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000000000000000000000000000000000000000000000000000466dd2ae07000000000000000000000000000000000000000000000000000000466dd2ae07000000000000000000000000000b1baf397b3946a81c7f5c54807474ecf194dc446000000000000000000000000bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c00000000000000000000000000000000000000000000000000e8928f535ac79600000000000000000000000000000000000000000000000000e8928f535ac79600000000000000000000000050015a452e644f5511fbeeac6b2ad2bf154e40e4",
  permitData: {
    domain: {
      name: "Permit2",
      chainId: "56",
      verifyingContract: "0x000000000022d473030f116ddee9f6b43ac78ba3",
    },
    types: {
      PermitWitnessTransferFrom: [
        {
          name: "permitted",
          type: "TokenPermissions",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
        },
        {
          name: "witness",
          type: "ExclusiveDutchOrder",
        },
      ],
      TokenPermissions: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
      ],
      ExclusiveDutchOrder: [
        {
          name: "info",
          type: "OrderInfo",
        },
        {
          name: "decayStartTime",
          type: "uint256",
        },
        {
          name: "decayEndTime",
          type: "uint256",
        },
        {
          name: "exclusiveFiller",
          type: "address",
        },
        {
          name: "exclusivityOverrideBps",
          type: "uint256",
        },
        {
          name: "inputToken",
          type: "address",
        },
        {
          name: "inputStartAmount",
          type: "uint256",
        },
        {
          name: "inputEndAmount",
          type: "uint256",
        },
        {
          name: "outputs",
          type: "DutchOutput[]",
        },
      ],
      OrderInfo: [
        {
          name: "reactor",
          type: "address",
        },
        {
          name: "swapper",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
        },
        {
          name: "additionalValidationContract",
          type: "address",
        },
        {
          name: "additionalValidationData",
          type: "bytes",
        },
      ],
      DutchOutput: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "startAmount",
          type: "uint256",
        },
        {
          name: "endAmount",
          type: "uint256",
        },
        {
          name: "recipient",
          type: "address",
        },
      ],
    },
    values: {
      permitted: {
        token: "0x55d398326f99059fF775485246999027B3197955",
        amount: {
          type: "BigNumber",
          hex: "0x021b24b011787dd9e3",
        },
      },
      spender: "0xe9E78109c89162cEF32Bfe7cBCEe1f31312fc1F6",
      nonce: {
        type: "BigNumber",
        hex: "0x66c6ed4a",
      },
      deadline: 1724313086,
      witness: {
        info: {
          reactor: "0xe9E78109c89162cEF32Bfe7cBCEe1f31312fc1F6",
          swapper: "0x50015A452E644F5511fbeeac6B2aD2bf154E40E4",
          nonce: {
            type: "BigNumber",
            hex: "0x66c6ed4a",
          },
          deadline: 1724313086,
          additionalValidationContract:
            "0x120971cAc17B63FFdaDf862724925914b025A9E6",
          additionalValidationData: "0x",
        },
        decayStartTime: 1724312916,
        decayEndTime: 1724312951,
        exclusiveFiller: "0x120971cAc17B63FFdaDf862724925914b025A9E6",
        exclusivityOverrideBps: {
          type: "BigNumber",
          hex: "0x00",
        },
        inputToken: "0x55d398326f99059fF775485246999027B3197955",
        inputStartAmount: {
          type: "BigNumber",
          hex: "0x021b24b011787dd9e3",
        },
        inputEndAmount: {
          type: "BigNumber",
          hex: "0x021b24b011787dd9e3",
        },
        outputs: [
          {
            token: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            startAmount: {
              type: "BigNumber",
              hex: "0x0466dd2ae07000",
            },
            endAmount: {
              type: "BigNumber",
              hex: "0x0466dd2ae07000",
            },
            recipient: "0xb1BaF397B3946a81c7f5C54807474ECF194dc446",
          },
          {
            token: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            startAmount: {
              type: "BigNumber",
              hex: "0xe8928f535ac796",
            },
            endAmount: {
              type: "BigNumber",
              hex: "0xe8928f535ac796",
            },
            recipient: "0x50015A452E644F5511fbeeac6B2aD2bf154E40E4",
          },
        ],
      },
    },
  },
  minAmountOut: "66140519978621861",
  amountOutUI: "-1",
  inTokenUsd: 1,
  outTokenUsd: 572.83,
  gasAmountOut: "1239000000000000",
} as QuoteResponse;
const txHash =
  "0xf47ff7feefa542b86d5d39d026daecaec5795ab7a0392b55cad41df70906377c";

const testFN = async () => {
  try {
    const res = await getTxDetailsFromApi(txHash, 56, quote);

    console.log({ res });
  } catch (error) {}
};
