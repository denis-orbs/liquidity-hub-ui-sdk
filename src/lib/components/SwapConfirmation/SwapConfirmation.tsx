import styled, { CSSObject } from "styled-components";
import { LiquidityHubPayload } from "../..";
import { ExplorerLink } from "../ExplorerLink";
import {
  SwapConfirmationProvider,
  useSwapConfirmationContext,
} from "./context";
import { SwapDetails } from "./Details";
import { StepsComponent } from "./Steps";
import { SwapFailed } from "./SwapFailed";
import { SwapSuccess } from "./SwapSuccess";
import { PoweredBy } from "./PoweredBy";
import { FlexColumn } from "../../base-styles";
import { Fragment, ReactNode } from "react";

interface Props {
  className?: string;
  style?: CSSObject;
  children: React.ReactNode;
  lhPayload: LiquidityHubPayload;
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
}

const SwapConfirmation = ({
  className = "",
  style = {},
  children,
  lhPayload,
  fromTokenUsd,
  toTokenUsd,
}: Props) => {
  return (
    <SwapConfirmationProvider
      fromTokenUsd={fromTokenUsd}
      toTokenUsd={toTokenUsd}
      lhPayload={lhPayload}
    >
      <Container className={`${className} lh-summary`} $style={style}>
        {children}
      </Container>
    </SwapConfirmationProvider>
  );
};

const Main = ({ SubmitButton }: { SubmitButton: ReactNode }) => {
  const { swapStatus } = useSwapConfirmationContext().lhPayload;

  <Fragment>
    {swapStatus === "success" ? (
      <SwapSuccess />
    ) : swapStatus === "failed" ? (
      <SwapFailed />
    ) : (
      <FlexColumn>
        <SwapDetails />
        <StepsComponent />
        {!swapStatus && SubmitButton}
      </FlexColumn>
    )}
    {!swapStatus || (swapStatus === "success" && <PoweredBy />)}
  </Fragment>;
};


const SubmitButton = ({children}:{children: ReactNode}) => {
const swapStatus = useSwapConfirmationContext().lhPayload.swapStatus;

if(swapStatus) return null;

  return <>{children}</>
}


const ExplorerLinkComponent = ({className = '', styles ={}}:{className?: string, styles?: CSSObject}) => {
  const { lhPayload } = useSwapConfirmationContext();
  
  return <ExplorerLink className={className} styles={styles} txHash={lhPayload.txHash} />
}

SwapConfirmation.Success = SwapSuccess;
SwapConfirmation.Error = SwapFailed;
SwapConfirmation.Details = SwapDetails;
SwapConfirmation.Steps = StepsComponent;
SwapConfirmation.ExplorerLink = ExplorerLinkComponent;
SwapConfirmation.PoweredBy = PoweredBy;
SwapConfirmation.SubmitButton = SubmitButton;
SwapConfirmation.Main = Main;

const Container = styled.div<{ $style: CSSObject }>`
  width: 100%;
  * {
    box-sizing: border-box;
  }
  ${({ $style }) => $style}
`;

export { SwapConfirmation };
