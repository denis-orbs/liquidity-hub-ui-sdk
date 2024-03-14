import { CSSObject } from "styled-components";
import _, { isEmpty } from "lodash";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { CSSProperties, FC, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { Token, TokenListItemProps } from "../type";
import { useDexState } from "../store/dex";
import { eqIgnoreCase, filterTokens } from "../util";
import { useTokenListBalances, useTokens, useUsdAmount } from "../dex/hooks";
import { FlexColumn } from "../base-styles";

type ListLabel = { isTitle: boolean; text: string };
type ITokenListItem = Token | ListLabel;

export const TokenListItem = (props: {
  index: number;
  style: CSSProperties;
  data: {
    items: ITokenListItem[];
    onTokenSelect: (token: Token) => void;
    ListItem: FC<TokenListItemProps>;
    ListLabel: FC<{ text: string }>;
  };
}) => {
  const { index, style, data } = props;
  const { ListItem, items, ListLabel } = data;
  const item = items[index];
  if ((item as ListLabel).isTitle) {
    return (
      <div style={style}>
        <ListLabel text={(item as ListLabel).text} />
      </div>
    );
  }

  return (
    <div style={style}>
      <TokenComponent
        token={item as Token}
        onTokenSelect={data.onTokenSelect}
        ListItem={ListItem}
      />
    </div>
  );
};

const TokenComponent = ({
  token,
  onTokenSelect,
  ListItem,
}: {
  token: Token;
  onTokenSelect: (token: Token) => void;
  ListItem: FC<TokenListItemProps>;
}) => {
  const { data: balances, isLoading: balanceLoading } = useTokenListBalances();
  const { fromToken, toToken } = useDexState(
    useShallow((store) => {
      return {
        fromToken: store.fromToken,
        toToken: store.toToken,
      };
    })
  );
  const balance = balances ? balances[token.address] : undefined;
  const priceUsd = useUsdAmount(token.address, balance);
  const disabled =
    eqIgnoreCase(token.address, fromToken?.address || "") ||
    eqIgnoreCase(token.address, toToken?.address || "");

  return (
    <StyledListToken
      className="lh-token-select-list-row"
      onClick={() => onTokenSelect(token)}
      $disabled={disabled}
    >
      <ListItem
        balance={balance}
        token={token}
        selected={disabled}
        balanceLoading={balanceLoading}
        usd={priceUsd.usd}
        usdLoading={priceUsd.isLoading}
      />
    </StyledListToken>
  );
};

export function TokenList({
  onTokenSelect,
  itemSize = 60,
  labelSize = 40,
  style = {},
  ListItem,
  ListLabel,
  filter,
}: {
  onTokenSelect: (token: Token) => void;
  itemSize?: number;
  style?: CSSObject;
  ListItem: (args: TokenListItemProps) => JSX.Element;
  ListLabel: FC<{ text: string }>;
  filter?: string;
  labelSize?: number;
}) {
  const listRef = useRef<List>(null);
  const list = useTokens();
  const balances = useTokenListBalances().data;

  const items = useMemo(() => {
    if (filter) {
      const result = [] as ITokenListItem[];
      const filtered = filterTokens(list, filter);
      if (_.size(filtered)) {
        result.splice(0, 0, { text: "Search results", isTitle: true });
        result.push(...filtered);
      }

      return result;
    }

    const result = _.cloneDeep(list) as ITokenListItem[];
    if (isEmpty(balances)) {
      result.splice(0, 0, { text: "Popular tokens", isTitle: true });
      return result;
    }

    const index = list.findIndex((token) => balances[token.address] === "0");
    result.splice(index, 0, { text: "Popular tokens", isTitle: true });
    if (index > 0) {
      result.splice(0, 0, { text: "Your Tokens", isTitle: true });
    }

    return result;
  }, [list, balances, filter]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [items]);

  const noResults = !!filter && _.size(items) === 0;

  return (
    <Container $style={style}>
      {noResults ? (
        <StyledNoResults className="lh-list-no-results">
          No results found
        </StyledNoResults>
      ) : (
        <AutoSizer>
          {({ height, width }: any) => (
            <List
              ref={listRef}
              overscanCount={6}
              className="List"
              itemData={{
                items: items || [],
                onTokenSelect,
                ListItem,
                ListLabel,
              }}
              height={height || 0}
              itemCount={_.size(items)}
              itemSize={(index) =>
                (items[index] as ListLabel).isTitle ? labelSize : itemSize
              }
              width={width || 0}
            >
              {TokenListItem}
            </List>
          )}
        </AutoSizer>
      )}
    </Container>
  );
}

const Container = styled(FlexColumn)<{ $style: CSSObject }>`
  width: 100%;
  flex: 1;
  ${({ $style }) => $style}
`;

const StyledNoResults = styled.p`
  font-size: 16px;
  width: 100%;
  text-align: center;
  padding-top: 20px;
`;

const StyledListToken = styled.div<{ $disabled?: boolean }>`
  width: 100%;
  height: 100%;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
`;
