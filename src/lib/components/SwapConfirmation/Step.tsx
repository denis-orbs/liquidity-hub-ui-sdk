import styled from "styled-components";
import { Check } from "react-feather";
import { Step } from "../../type";
import { FlexColumn, FlexRow } from "../../base-styles";
import { Spinner } from "../Spinner";
import _ from "lodash";
import { Text } from "../Text";
import { useSignatureTimeout } from "../../hooks";
import { SIGNATURE_TIMEOUT_MILLIS } from "../../config/consts";

interface Props {
  step: Step;
  component?: React.ReactNode;
}

export function StepComponent({ step }: Props) {
  return (
    <StyledStep className="lh-step">
      <Logo step={step} />
      <FlexColumn $gap={5}>
        <StyledStepTitle
          $selected={Boolean(step.active || step.completed)}
          className="lh-step-title"
        >
          {step.title}
        </StyledStepTitle>
        <StepLink step={step} />
      </FlexColumn>
      <StepStatus step={step} />
    </StyledStep>
  );
}

const StepStatus = ({ step }: { step: Step }) => {
  if (step.completed) {
    return (
      <StyledStatus>
        <StyledSuccess>
          <Check size={20} />
        </StyledSuccess>
      </StyledStatus>
    );
  }

  if (!step.active) return null;

  if (step.timeout) {
    return (
      <StyledStatus>
        <SignatureDeadline timeout={step.timeout} />
      </StyledStatus>
    );
  }

  return null;
};

const SignatureDeadline = ({
  timeout = SIGNATURE_TIMEOUT_MILLIS,
}: {
  timeout?: number;
}) => {
  const { minutes, seconds } = useSignatureTimeout(timeout);

  return (
    <StyledDeadline className="lh-step-deadline">
      {minutes}:{seconds}
    </StyledDeadline>
  );
};

const StyledDeadline = styled(Text)({
  fontSize: 14,
});

const StepLink = ({ step }: { step: Step }) => {
  if (!step.link) return null;

  return (
    <StyledStepLink
      className="lh-step-link"
      href={step.link.href}
      target="_blank"
      $selected={Boolean(step.active || step.completed)}
    >
      {step.link.text}
    </StyledStepLink>
  );
};

const StyledStatus = styled.div`
  margin-left: auto;
`;

const Logo = ({ step }: { step?: Step }) => {
  const selected = step?.active || step?.completed;
  return (
    <StyledStepLogo $selected={Boolean(selected)} className="lh-step-logo">
      {step?.active ? (
        <StyledLoader size={28} className="lh-step-loader" />
      ) : (
        <img src={step?.image} />
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

const StyledStepTitle = styled(Text)<{ $selected: boolean }>`
  opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
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
`;
