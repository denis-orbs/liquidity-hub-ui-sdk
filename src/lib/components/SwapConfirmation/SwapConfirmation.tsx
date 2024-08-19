import styled, { CSSObject } from "styled-components";
import {
  SwapConfirmationProvider,
  useSwapConfirmationContext,
} from "./context";
import { SwapDetails } from "./Details";
import { SwapConfirmationSteps } from "./SwapConfirmationSteps";
import { FailedContent } from "./Content/FailedContent";
import { FlexColumn, FlexRow } from "../../base-styles";
import { Fragment, ReactNode } from "react";
import { SuccessContent } from "./Content/SuccessContent";
import { SkeletonLoader } from "../../../Widget/components/SkeletonLoader";
import { SwapConfirmationArgs, SwapStatus } from "../../type";
import { PoweredByOrbs } from "../PoweredByOrbs";
import { useSwapConfirmationSteps } from "./useSwapConfirmationSteps";

interface Props extends SwapConfirmationArgs {
  className?: string;
  style?: CSSObject;
  children?: ReactNode;
}

const SwapConfirmation = ({
  className = "",
  children,
  style = {},
  ...args
}: Props) => {
  return (
    <SwapConfirmationProvider {...args}>
      <Container className={`${className} lh-summary`} $style={style}>
        <SwapConfirmationContent>{children}</SwapConfirmationContent>
      </Container>
    </SwapConfirmationProvider>
  );
};

const SwapConfirmationContent = ({ children }: { children: ReactNode }) => {
  const { swapStatus } = useSwapConfirmationContext();

  return (
    <Fragment>
      {swapStatus === SwapStatus.SUCCESS ? (
        <SuccessContent />
      ) : swapStatus === SwapStatus.FAILED ? (
        <FailedContent />
      ) : (
        <SwapMain>{children}</SwapMain>
      )}
    </Fragment>
  );
};

const Loader = () => {
  return (
    <StyledLoader>
      <CircleLoader />
      <RectengularLoader />
    </StyledLoader>
  );
};

const CircleLoader = styled(SkeletonLoader)({
  width: 30,
  height: 30,
  borderRadius: "50%",
});
const RectengularLoader = styled(SkeletonLoader)({
  flex: 1,
  height: 20,
  borderRadius: 5,
  maxWidth: 200,
});

const StyledLoader = styled(FlexRow)({
  justifyContent: "flex-start",
});

const SwapMain = ({ children }: { children: ReactNode }) => {
  const { swapStatus } = useSwapConfirmationContext();
  const steps = useSwapConfirmationSteps();
  
  if (!steps) {
    return <Loader />;
  }

  if (!swapStatus) {
    return (
      <FlexColumn>
        <SwapDetails />
        {children}
        <StyledPoweredByOrbs />
      </FlexColumn>
    );
  }

  // if(steps.length === 1) {
  //   return <SingleStepContent />
  // }

  return (
    <FlexColumn>
      <SwapDetails />
      <SwapConfirmationSteps />
    </FlexColumn>
  );
};

const StyledPoweredByOrbs = styled(PoweredByOrbs)({
  marginTop: 20,
});

const Container = styled.div<{ $style: CSSObject }>`
  width: 100%;
  * {
    box-sizing: border-box;
  }
  ${({ $style }) => $style}
`;

export { SwapConfirmation };
