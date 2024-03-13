import styled, { CSSObject, keyframes } from "styled-components";

const animation = keyframes`

    0% {
      opacity: 0.2;
    }
    100% {
      opacity: 0.4;
    }
`;

const Skeleton = styled.div`
  animation: ${animation} 1s linear infinite alternate;
  width: 100%;
  height: 30px;
  background-color: white;
`;

export function SkeletonLoader({ styles = {} }: { styles?: CSSObject }) {
  return <Skeleton style={styles} />;
}
