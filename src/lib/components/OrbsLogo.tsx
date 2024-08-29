import styled from "styled-components";
export const OrbsLogo = ({
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <StyledOrbsLogo
      className={`lh-logo ${className}`}
      alt="Orbs logo"
      src="https://www.orbs.com/assets/img/common/logo.svg"
    />
  );
};

const StyledOrbsLogo = styled("img")`
  object-fit: contain;
  display: inline;
`;
