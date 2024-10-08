import { ReactNode } from "react";
import styled from "styled-components";
import { Spinner } from "./Spinner";
export function Button({
  children,
  className = "",
  onClick,
  isLoading,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Container
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <div style={{ opacity: isLoading ? 0 : 1 }}>{children}</div>
      {isLoading && <Spinner />}
    </Container>
  );
}

const Container = styled.button<{ $bg?: string; $hoverBg?: string }>`
  font-size: 15px;
  font-weight: 600;
  min-height: 50px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s;
  background: rgb(252, 114, 255);
  color: white;
`;
