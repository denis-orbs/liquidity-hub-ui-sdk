import { CSSProperties } from 'react';
import styled from 'styled-components';
export function Logo({
  src,
  alt = "",
  imgStyle = {},
  className = "",
}: {
  src?: string;
  alt?: string;
  imgStyle?: CSSProperties;
  className?: string;
}) {
  return (
    <Container className={className}>
      <StyledImg src={src} alt={alt} style={imgStyle} />
    </Container>
  );
}

const Container = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  oveflow: hidden;
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  oveflow: hidden;
`;
