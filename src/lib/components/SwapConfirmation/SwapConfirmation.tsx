import styled, { CSSObject } from "styled-components";
import { SwapConfirmationArgs } from "../..";
import { ExplorerLink } from "../ExplorerLink";
import {
  SwapConfirmationProvider,
} from "./context";
import { SwapDetails } from "./Details";
import { StepsComponent } from "./Steps";
import { SwapFailed } from "./SwapFailed";
import { SwapSuccess } from "./SwapSuccess";
import { PoweredBy } from "./PoweredBy";
import { FlexColumn } from "../../base-styles";
import { Fragment, ReactNode } from "react";
import { useMainContext } from "../../context/MainContext";




interface Props extends SwapConfirmationArgs {
  className?: string;
  style?: CSSObject;
  children: React.ReactNode;
  
}

const SwapConfirmation = ({
  className = "",
  style = {},
  children,
  ...args
}: Props) => {
  return (
    <SwapConfirmationProvider {...args}>
      <Container className={`${className} lh-summary`} $style={style}>
        {children}
      </Container>
    </SwapConfirmationProvider>
  );
};

const Main = ({ SubmitButton }: { SubmitButton: ReactNode }) => {
  const { swapStatus } = useMainContext();

  return (
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
       <PoweredBy style={{ marginTop: 30 }} />
    </Fragment>
  );
};

const SubmitButton = ({ children }: { children: ReactNode }) => {
  const {swapStatus} = useMainContext();

  if (swapStatus) return null;

  return <>{children}</>;
};

const ExplorerLinkComponent = ({
  className = "",
  styles = {},
}: {
  className?: string;
  styles?: CSSObject;
}) => {
  const { txHash } = useMainContext();

  return (
    <ExplorerLink
      className={className}
      styles={styles}
      txHash={txHash}
    />
  );
};

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
