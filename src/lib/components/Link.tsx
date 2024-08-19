import React from "react";
import { styled } from "styled-components";

export function Link({
  url,
  children,
  className = ''
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return <StyledLink className={`${className} lh-link`} href={url} target='_blank'>{children}</StyledLink>;
}


const StyledLink = styled('a')({
    color:'white',
    textDecoration:'none',
    outline:'none',
})