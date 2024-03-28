import { CSSProperties } from "react";
import { CSSObject, styled } from "styled-components";
import { OrbsLogo } from "./OrbsLogo";

export const PoweredByOrbs = ({
  className = "",
  style = {},
  labelStyles = {},
  symbolStyle = {},
}: {
  className?: string;
  style?: CSSObject;
  labelStyles?: CSSProperties;
  symbolStyle?: CSSProperties;
}) => {
  return (
    <StyledLink
      style={style}
      className={`lh-powered-by ${className}`}
      href="https://www.orbs.com/"
      target="_blank"
      rel="noreferrer"
    >
      <span style={labelStyles} className="lh-powered-by-title">
        powered by
      </span>
      <OrbsLogo width={18} height={18} />
      <span className="lh-powered-by-symbol" style={symbolStyle}>
        ORBS
      </span>
    </StyledLink>
  );
};

const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.textMain};
  text-decoration: none;
  font-size: 15px;
  line-height: 18px;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  border:1px solid rgba(255,255,255,0.4);
  width: auto;
  padding: 5px 9px;
  border-radius: 8px;
  margin-left: auto;
  margin-right: auto;
  img {
    margin-left: 6px;
    margin-right: 6px;

  }
`;
