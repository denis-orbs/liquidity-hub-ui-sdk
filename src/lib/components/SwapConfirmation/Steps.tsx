import styled from "styled-components";
import { useSteps } from "../..";
import { FlexColumn, FlexRow } from "../../base-styles";
import { SkeletonLoader } from "../SkeletonLoader";
import { useSwapConfirmationContext } from "./context";
import { StepComponent } from "./Step";

export const StepsComponent = () => {
  const { swapStatus } =
    useSwapConfirmationContext();
  const { steps, isLoading } = useSteps();
  if (swapStatus !== "loading") return null;

  return (
    <>
      <StyledSteps $gap={15} style={{ width: "100%" }} className="lh-steps">
        {isLoading ? (
          <FlexRow style={{ width: "100%", justifyContent:'flex-start' }}>
            <SkeletonLoader
              styles={{ width: "30px", height: "30px", borderRadius: "50%" }}
            />
            <SkeletonLoader
              styles={{ width: "50%", height: "20px", borderRadius: "20px" }}
            />
          </FlexRow>
        ) : (
          <>
            <Divider className="lh-steps-divider" />
            {steps.map((step) => {
              return <StepComponent key={step.id} step={step} />;
            })}
          </>
        )}
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
