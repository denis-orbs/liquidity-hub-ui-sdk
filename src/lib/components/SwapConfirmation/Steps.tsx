import styled from "styled-components";
import { useSteps } from "../..";
import { FlexColumn } from "../../base-styles";
import { useSwapConfirmationContext } from "./context";
import { StepComponent } from "./Step";

export const StepsComponent = () => {
  const { swapStatus } = useSwapConfirmationContext();
  const steps = useSteps();
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
