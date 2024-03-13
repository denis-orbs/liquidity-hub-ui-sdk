import { CSSObject } from "styled-components";
import _ from "lodash";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { CSSProperties, FC } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { Token, TokenListItemProps } from "../type";
import { useDexState } from "../store/dex";
import { eqIgnoreCase } from "../util";
import { useTokenListBalances } from "../dex/hooks";


export const TokenListItem = (props: {
  index: number;
  style: CSSProperties;
  data: {
    tokens: Token[];
    onTokenSelect: (token: Token) => void;
    ListItem: FC<TokenListItemProps>;
  };
}) => {
  const {data: balances} = useTokenListBalances()
  
  const { index, style, data } = props;
  const { ListItem, tokens } = data;

  const token = tokens[index];
  const { fromToken, toToken } = useDexState(
    useShallow((store) => {
      return {
        fromToken: store.fromToken,
        toToken: store.toToken,
      };
    })
  );

  const disabled =
    eqIgnoreCase(token.address, fromToken?.address || "") ||
    eqIgnoreCase(token.address, toToken?.address || "");

  return (
    <div style={style}>
      <StyledListToken
        className="lh-token-select-list-row"
        onClick={() => data.onTokenSelect(token)}
        $disabled={disabled}
      >
        <ListItem
          balance={balances  ? balances[token.address] : undefined}
          token={token}
          selected={disabled}
        />
      </StyledListToken>
    </div>
  );
};

export function TokenList({
  onTokenSelect,
  itemSize = 60,
  tokens = [],
  style = {},
  ListItem,
}: {
  onTokenSelect: (token: Token) => void;
  itemSize?: number;
  tokens?: Token[];
  style?: CSSObject;
  ListItem: (args: TokenListItemProps) => JSX.Element;
}) {
  return (
    <AutoSizer style={style}>
      {({ height, width }: any) => (
        <List
          overscanCount={6}
          className="List"
          itemData={{ tokens: tokens || [], onTokenSelect, ListItem }}
          height={height || 0}
          itemCount={_.size(tokens)}
          itemSize={itemSize}
          width={width || 0}
        >
          {TokenListItem}
        </List>
      )}
    </AutoSizer>
  );
}

const StyledListToken = styled.div<{ $disabled?: boolean }>`
  width: 100%;
  height: 100%;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
`;
