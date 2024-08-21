import styled from "styled-components";
import { Step } from "../..";
import { FlexColumn } from "../../base-styles";
import { StepComponent } from "./Step";

export const SwapSteps = ({
  steps,
  className = "",
}: {
  steps?: Step[];
  className?: string;
}) => {
  return (
    <StyledSteps style={{ width: "100%" }} className={`lh-steps ${className}`}>
      <Divider className="lh-steps-divider" />
      {steps?.map((step) => {
        return <StepComponent key={step.id} step={step} />;
      })}
    </StyledSteps>
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
  padding-top: 20px;
  position: relative;
  border-top: 1px solid #433d53;
  gap: 7px;
`;
