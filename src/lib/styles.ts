import styled, {CSSObject} from "styled-components";
import { FlexColumn, FlexRow } from "./base-styles";
import { NumericInput } from "./components/NumericInput";
import { SwapDetails } from "./components/SwapDetails/SwapDetails";


export const StyledChangeTokens = styled(FlexRow)<{ $style?: CSSObject }>`
  height: 8px;
  width: 100%;
  justify-content: center;

  button {
    cursor: pointer;
    position: relative;
    background: transparent;
    border: unset;
    border-radius: 50%;
    border: 8px solid rgb(40, 45, 61);
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(105, 108, 128);
  }
  svg {
    color: #282d3d;
    width: 14px;
  }
  ${({ $style }) => $style}
`;

export const StyledInput = styled(NumericInput)<{ $alignLeft: boolean  }>`
  width: 100%;

  input {
    font-size: 24px;
    text-align: ${({ $alignLeft }) => ($alignLeft ? "left" : "right")};
    color: white;
  }
`;

export const StyledContainer = styled.div<{ $style?: CSSObject }>`
  color: white;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  background-color: #1b1e29;
  padding: 24px;
  border-radius: 20px;
  ${({ $style }) => $style}
`;

export const StyledPercentButtons = styled(FlexRow)<{ $style?: CSSObject }>`
  gap: 20px;
  button {
    background: transparent;

    border: unset;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }
  ${({ $style }) => $style}
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

export const StyledTop = styled(FlexRow)`
  width: 100%;
  justify-content: space-between;
`;

const Card = styled(FlexColumn)`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 10px;
  padding: 16px;
  gap: 16px;
`;

export const StyledTokenPanelContent = styled(Card)<{ $style?: CSSObject }>`
  width: 100%;
  ${({ $style }) => $style}
`;

export const StyledTokenPanel = styled(FlexColumn)<{
  $inputLeft: boolean;
  $usdLeft: boolean;
}>`
  width: 100%;
  .lh-input {
    order: ${({ $inputLeft }) => ($inputLeft ? 1 : 2)};
    input {
      text-align: ${({ $inputLeft }) => ($inputLeft ? "left" : "right")};
    }
  }
  .lh-token-select {
    order: ${({ $inputLeft }) => ($inputLeft ? 2 : 1)};
  }
  .lh-usd {
    order: ${({ $usdLeft }) => ($usdLeft ? 1 : 2)};
  }
  .lh-balance {
    order: ${({ $usdLeft }) => ($usdLeft ? 2 : 1)};
  }
`;

export const StyledSwapDetails = styled(SwapDetails)`
  background-color: transparent;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderMain};
  padding: 16px;
  margin-top: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
`;
