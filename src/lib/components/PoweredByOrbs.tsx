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
        Powered by
      </span>{" "}
      <span className="lh-powered-by-symbol" style={symbolStyle}>
        Orbs
      </span>{" "}
      <OrbsLogo />
    </StyledLink>
  );
};

const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.textMain};
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 3px;
  width: 100%;
  justify-content: center;
  img {
    margin-left: 5px;
  }
`;
