import { styled } from "styled-components";
import { OrbsLogo } from "./OrbsLogo";
import { Text } from "./Text";

export const PoweredByOrbs = ({ className = "" }: { className?: string }) => {
  return (
    <StyledLink className={`lh-powered-by ${className}`}>
      <a href="https://www.orbs.com/" target="_blank" rel="noreferrer">
        <span className="lh-powered-by-title">powered by</span>
        <OrbsLogo width={18} height={18} />
        <span className="lh-powered-by-symbol">ORBS</span>
      </a>
    </StyledLink>
  );
};

const StyledLink = styled(Text)`
  border-radius: 8px;
  margin-left: auto;
  margin-right: auto;
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: unset;
    img {
      margin-left: 6px;
      margin-right: 6px;
      width: 18px;
      height: 18px;
    }
  }
  
`;
