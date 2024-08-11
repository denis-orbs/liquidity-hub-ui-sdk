import { useMemo, useState } from "react";
import { CSSObject, styled } from "styled-components";
import { WidgetModal } from "../Modal";
import BN from "bignumber.js";
import { Token, useAmountUI, useFormatNumber } from "../../lib";
import { useMainContext } from "../../lib/context/MainContext";
import { usePercentSelect, usePriceUsd, useTokenListBalance } from "../hooks";
import { FlexRow, FlexColumn } from "../../lib/base-styles";
import { Logo } from "../../lib/components/Logo";
import { StyledTokenPanel, StyledTokenPanelContent, StyledInput, StyledPercentButtons } from "../styles";
import { Text } from "../../lib/components/Text";
import { useWidgetContext } from "../context";
import { TokenList, TokenListItemProps } from "./TokenList";
import { TokenSearchInput } from "./SearchInput";
import { LoadingText } from "./LoadingText";


export interface TokenPanelProps {
  inputValue?: string;
  onInputChange?: (value: string) => void;
  token?: Token;
  label?: string;
  isSrc?: boolean;
  onTokenSelect: (token: Token) => void;
  usd?: string;
  usdLoading?: boolean;
}

export const TokenPanel = ({
  inputValue,
  onInputChange,
  token,
  label,
  isSrc,
  onTokenSelect,
  usd: _usd,
  usdLoading,
}: TokenPanelProps) => {
  const account = useMainContext().account;

  const { balance: _balance, isLoading: balanceLoading } = useTokenListBalance(
    token?.address
  );

  const balanceUi = useAmountUI(token?.decimals, _balance);
  const balance = useFormatNumber({
    value: balanceUi,
  });

  const fetchingBalancesAfterTx = useWidgetContext().state.fetchingBalancesAfterTx;

  const usd = useFormatNumber({ value: _usd });

  const header = <TokenPanelHeader isSrc={isSrc} label={label} />;

  return (
    <StyledTokenPanel className="lh-token-panel-container">
      <StyledTokenPanelContent className="lh-token-panel-container-content">
        {header}
        <FlexRow style={{ width: "100%", gap: 12 }}>
          <>
            <StyledInput
              onChange={onInputChange}
              value={inputValue}
              placeholder="0.00"
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

const defaultPercentButtons = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const PercentButtons = () => {
  const onPercentageChange = usePercentSelect();

  defaultPercentButtons;
  return (
    <StyledPercentButtons className="lh-percent-container">
      {defaultPercentButtons?.map((it, index) => {
        return (
          <button key={index} onClick={() => onPercentageChange(it.value)}>
            {it.label}
          </button>
        );
      })}
    </StyledPercentButtons>
  );
};

const StyledTokenListContainer = styled(FlexColumn)`
  color: white;
  max-height: 50vh;
  height: 500px;
  width: 100%;
`;

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
      <WidgetModal open={open} onClose={() => setOpen(false)}>
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

const USD = styled(LoadingText)`
  height: 13px;
  text-align: right;
  margin-left: auto;
`;

const Balance = styled(LoadingText)`
  height: 13px;
`;

const StyledTop = styled(FlexRow)`
  width: 100%;
  justify-content: space-between;
`;

export const StyledTokenListLabel = styled.div`
  padding: 0px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

export const StyledTokenSelect = styled(FlexRow)<{
  $selected: boolean;
  $style?: CSSObject;
}>`
  width: fit-content;
  padding: 8px 13px 8px 8px;
  border-radius: 38px;
  height: 40px;
  gap: 10px;
  cursor: pointer;
  background: ${({ $selected }) =>
    $selected
      ? "rgb(64, 69, 87)"
      : "linear-gradient(105deg, rgb(68, 138, 255) 3%, rgb(0, 76, 230))"};

  p {
    color: white;
  }
  ${({ $style }) => $style}
`;
