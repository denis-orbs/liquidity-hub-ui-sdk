import styled, {CSSObject} from 'styled-components';

export const FlexRow = styled.div<{
  $gap?: number;
  $alignItems?: string;
  $justifyContent?: string;
}>`
  display: flex;
  flex-direction: row;
  align-items: ${({ $alignItems }) => $alignItems || "center"};
  gap: ${({ $gap }) => $gap || 10}px;
  justify-content: ${({ $justifyContent }) => $justifyContent || "center"};
`;
export const FlexColumn = styled.div<{
  $gap?: number;
  $alignItems?: string;
  $style?: CSSObject;
}>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $alignItems }) => $alignItems || "flex-start"};
  gap: ${({ $gap }) => $gap || 10}px;
  ${({ $style }) => $style}
`;
