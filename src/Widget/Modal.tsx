import { ReactNode } from "react";
import Popup from "reactjs-popup";
import styled from "styled-components";
import {X} from 'react-feather'
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
    <Popup open={open} onClose={onClose} contentStyle={{background:'black', padding: 20, borderRadius: 20, width:'100%', maxWidth: 500}}>
      <StyledcloseButton onClick={onClose}>
        <X />
      </StyledcloseButton>
      <StyledContent>{children}</StyledContent>
    </Popup>
  );
};

const StyledcloseButton = styled.div`
  color: white;
  position: absolute;
  right: 16px;
  top: 16px;
  cursor: pointer;
`

const StyledContent = styled.div`
  padding-top: 30px;
`;
