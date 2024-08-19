import styled, {CSSObject, createGlobalStyle} from "styled-components";
import { PoweredByOrbs } from "../lib";
import { FlexColumn, FlexRow } from "../lib/base-styles";
import { NumericInput } from "./components/NumericInput";


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

export const StyledInput = styled(NumericInput)`
  width: 100%;

  input {
    font-size: 24px;
    text-align: left;
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
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }
  ${({ $style }) => $style}
`;



const Card = styled(FlexColumn)`
  border-radius: 10px;
  padding: 16px;
  gap: 16px;
`;

export const StyledTokenPanelContent = styled(Card)<{ $style?: CSSObject }>`
  width: 100%;
  ${({ $style }) => $style}
`;

export const StyledTokenPanel = styled(FlexColumn)`
  width: 100%;
  .lh-input {

  }
  .lh-token-select {
  }
  .lh-usd {
  }
  .lh-balance {
  }
`;


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



export const GlobalStyles = createGlobalStyle({
  ".popup-content": {
    background: "red"
  }
})

export const StyledPoweredByOrbs = styled(PoweredByOrbs)`
margin-top: 20px;
`