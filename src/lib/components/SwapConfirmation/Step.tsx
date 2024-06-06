import { useMemo } from "react";
import styled from "styled-components";
import { Check } from "react-feather";
import { ActionStatus, Step } from "../../type";
import { FlexColumn, FlexRow } from "../../base-styles";
import { Spinner } from "../Spinner";
import _ from "lodash";
import { useSwapConfirmationContext } from "./context";

interface Props {
  step: Step;

}

export function StepComponent({ step}: Props) {
  const {currentStep, swapStatus} = useSwapConfirmationContext();

  const status = useMemo((): ActionStatus => {
    if (_.isUndefined(currentStep)) return;
    if (step.id < currentStep) {
      return "success";
    }
    if (step.id > currentStep) {
      return undefined;
    }
    return swapStatus;
  }, [swapStatus, currentStep, step.id]);

  const selected = step.id === currentStep;
  return (
    <StyledStep className="lh-step">
      <Logo status={status} image={step.image} selected={selected} />
      <FlexColumn $gap={5}>
        <StyledStepTitle $selected={selected} className="lh-step-title">
          {step.title}
        </StyledStepTitle>
        {step.link && (
          <StyledStepLink
            className="lh-step-link"
            href={step.link.href}
            target="_blank"
            $selected={selected}
          >
            {step.link.text}
          </StyledStepLink>
        )}
      </FlexColumn>
      {status === "success" && (
        <StyledSuccess>
          <Check size={20} />
        </StyledSuccess>
      )}
    </StyledStep>
  );
}

const Logo = ({
  image,
  selected,
  status,
}: {
  image?: string;
  selected: boolean;
  status: ActionStatus;
}) => {
  return (
    <StyledStepLogo $selected={selected} className="lh-step-logo">
      {status === "loading" ? (
        <StyledLoader size={28} className="lh-step-loader" />
      ) : (
        <img src={image} />
      )}
    </StyledStepLogo>
  );
};

const StyledLoader = styled(Spinner)`
  background-color: #131118;
  position: relative;
  top: -2px;
  left: -1px;
`;

const StyledStep = styled(FlexRow)`
  min-height: 40px;
  width: 100%;
  gap: 16px;
  justify-content: flex-start;
`;

const StyledStepLogo = styled.div<{ $selected: boolean }>`
  width: 26px;
  height: 26px;
  position: relative;
  background-color: ${({ $selected }) => (!$selected ? "#434343" : "unset")};
  border-radius: 50%;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
    opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
    filter: ${({ $selected }) =>
      $selected ? "none!important" : "grayscale(100%)!important"};
  }
`;

const StyledStepTitle = styled.p<{ $selected: boolean }>`
  opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.textMain : theme.colors.textSecondary};
    a {
      color: #da88de;
      text-decoration: none;
    }
`;
const StyledStepLink = styled("a")<{ $selected: boolean }>`
  color: #da88de;
  opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
  text-decoration: none;
`;

const StyledSuccess = styled.div`
  margin-left: auto;
  color: ${({ theme }) => theme.colors.textMain};
  * {
    color: ${({ theme }) => theme.colors.textMain};
  }
`;
