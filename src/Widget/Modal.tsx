import { ReactNode } from "react";
import Popup from "reactjs-popup";
import styled from "styled-components";
import "reactjs-popup/dist/index.css";

export const WidgetModal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}) => {
  return (
    <Popup open={open} onClose={onClose} contentStyle={{background:'black', padding: 20, borderRadius: 20}}>
      <StyledContent>{children}</StyledContent>
    </Popup>
  );
};

const StyledContent = styled.div`

`;
