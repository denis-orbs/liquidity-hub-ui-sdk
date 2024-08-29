import styled from "styled-components";
const StyledSpinner = styled.div<{
  $size?: number;
  $borderWidth?: number;
  $borderColor?: string;
  $bottomBorderColor?: string;
}>`
    width: ${({ $size }) => $size || 38}px;
    height: ${({ $size }) => $size || 38}px;
    border:  ${({ $borderWidth }) => $borderWidth || 3}px   solid ${({ $borderColor }) => $borderColor || "white"};
    border-bottom-color: ${({ $bottomBorderColor }) =>
      $bottomBorderColor || "rgba(255, 255, 255, 0.2)"};
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
`;

export const Spinner = ({
  className = "",
  size,
  borderWidth,
}: {
  className?: string;
  size?: number;
  borderWidth?: number;
}) => {
  return (
    <StyledSpinner
      className={className}
      $size={size}
      $borderWidth={borderWidth}
    />
  );
};
