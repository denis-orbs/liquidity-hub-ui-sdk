import styled from "styled-components";
import { Check } from "react-feather";
import { Step, SwapStep } from "../../type";
import { FlexColumn,FlexRow } from "../../base-styles";
import { Spinner } from "../Spinner";
import _ from "lodash";
import { useSignatureDeadline } from "../../hooks/swap/useSignatureDeadline";
import { Text } from "../Text";

interface Props {
  step: Step;
  refetchQuote?: () => Promise<void>;
}

export function StepComponent({ step, refetchQuote }: Props) {
  return (
    <StyledStep className="lh-step">
      <Logo step={step} />
      <FlexColumn $gap={5}>
        <StyledStepTitle $selected={!!step.active} className="lh-step-title">
          {step.title}
        </StyledStepTitle>
        <StepLink step={step} />
      </FlexColumn>
      <StepStatus step={step} refetchQuote={refetchQuote} />
    </StyledStep>
  );
}

const StepStatus = ({
  step,
  refetchQuote,
}: {
  step: Step;
  refetchQuote?: () => Promise<void>;
}) => {
  const showRefetchTimer =
    refetchQuote && step.active && step.id >= SwapStep.SIGN_AND_SEND;

  return (
    <StyledStatus>
      {step.completed ? (
        <StyledSuccess>
          <Check size={20} />
        </StyledSuccess>
      ) : showRefetchTimer ? (
        <RefetchQuote refetchQuote={refetchQuote} />
      ) : null}
    </StyledStatus>
  );
};

const StepLink = ({ step }: { step: Step }) => {
  if (!step.link) return null;

  return (
    <StyledStepLink
      className="lh-step-link"
      href={step.link.href}
      target="_blank"
      $selected={!!step.active}
    >
      {step.link.text}
    </StyledStepLink>
  );
};

const RefetchQuote = ({
  refetchQuote,
}: {
  refetchQuote: () => Promise<void>;
}) => {
  const { minutes, seconds } = useSignatureDeadline(refetchQuote);

  return (
    <Text className="lh-step-deadline">
      {minutes}:{seconds}
    </Text>
  );
};

const StyledStatus = styled.div`
  margin-left: auto;
`;

const Logo = ({ step }: { step?: Step }) => {
  return (
    <StyledStepLogo $selected={!!step?.active} className="lh-step-logo">
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
