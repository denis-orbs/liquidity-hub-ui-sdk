
import styled, { CSSProperties } from "styled-components";
import { SkeletonLoader } from "./SkeletonLoader";
import { Text } from "./Text";

interface Props {
  value?: string;
  className?: string;
  css?: CSSProperties;
  isLoading?: boolean;
}

export function LoadingText({ value, className = "", css = {}, isLoading }: Props) {

  return (
    <Container className={`lh-loading-text ${className}`} style={css}>
      {isLoading ? (
        <SkeletonLoader
          styles={{
            width: "100%",
            height: "100%",
            borderRadius: "5px",
            minWidth: 50,
            minHeight: 14,
          }}
        />
      ) : (
        <StyledText> {value}</StyledText>
      )}
    </Container>
  );
}

const StyledText = styled(Text)`
    font-size: inherit;
    color: inherit;
    font-weight: inherit;
`

const Container = styled.div`
  font-size: 14px;
`;
