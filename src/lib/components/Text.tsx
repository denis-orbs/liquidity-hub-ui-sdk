import { CSSProperties, ReactNode } from "react";
import styled from "styled-components";

export function Text({
  children,
  style = {},
  className,
  fontSize = 16,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  fontSize?: number;
}) {
  return (
    <StyledText $fontSize={fontSize} className={`lh-text ${className}`} style={style}>
      {children}
    </StyledText>
  );
}

const StyledText = styled.p<{ $fontSize: number }>`
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.colors.textMain};
  font-size: ${({ $fontSize }) => `${$fontSize}px`};
  font-family: inherit;
`;