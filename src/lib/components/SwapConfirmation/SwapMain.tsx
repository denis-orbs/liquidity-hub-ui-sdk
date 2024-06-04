import styled, { CSSObject } from "styled-components";
import { StepComponent } from "./Step";
import { SwapDetails } from "./Details";
import { FlexColumn } from "../../base-styles";
import { ExplorerLink } from "../ExplorerLink";
import { useSwapConfirmationContext } from "./context";

interface Props {
  style?: CSSObject;
}

export const SwapMain = ({ style = {} }: Props) => {
  const { bottomContent, fromTokenUsd, toTokenUsd, txHash } = useSwapConfirmationContext();
  return (
    <Container style={style}>
      <SwapDetails fromTokenUsd={fromTokenUsd} toTokenUsd={toTokenUsd} />
      <StepsComponent />
      {bottomContent}
      <ExplorerLink styles={{ marginTop: 10 }} txHash={txHash} />
    </Container>
  );
};

const StepsComponent = () => {
  const {steps, swapStatus} = useSwapConfirmationContext();
  if (swapStatus !== "loading") return null;

  return (
    <>
      <StyledSteps $gap={15} style={{ width: "100%" }} className="lh-steps">
        <Divider className="lh-steps-divider" />
        {steps.map((step) => {
          return <StepComponent key={step.id} step={step} />;
        })}
      </StyledSteps>
    </>
  );
};

const Container = styled(FlexColumn)`
  width: 100%;
`;

const Divider = styled.div`
  width: 2px;
  height: calc(100% - 50px);
  background-color: #434343;
  left: 12px;
  position: absolute;
  top: 35px;
`;

const StyledSteps = styled(FlexColumn)`
  margin-top: 25px;
  border-top: 1px solid ${(props) => props.theme.colors.divider};
  padding-top: 20px;
  position: relative;
  background-color: ${(props) => props.theme.colors.onyx};
  border-top: 1px solid #433d53;
`;
