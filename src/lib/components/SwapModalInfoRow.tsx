import styled from "styled-components";
import { Text } from "./Text";
import { ReactNode } from "react";
import { FlexRow } from "../base-styles";

const StyledRowLabel = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
`;

const StyledRowChildren = styled.div`
  font-size: 14px;
  * {
    font-size: inherit;
  }
`;

export const SwapModalInfoRow = ({
  label,
  children,
  onClick
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <StyledRow onClick={onClick}>
      <StyledRowLabel>{label}</StyledRowLabel>
      <StyledRowChildren>{children}</StyledRowChildren>
    </StyledRow>
  );
};

const StyledRow = styled(FlexRow)`
  justify-content: space-between;
  width: 100%;
  cursor: ${({ onClick }) => (onClick ? "pointer" : "default")};
`;
