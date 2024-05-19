/* eslint-disable import/no-extraneous-dependencies */
import Popup from "reactjs-popup";
import styled, { useTheme, keyframes } from "styled-components";
import { X } from "react-feather";
import { ReactNode } from "react";
import "reactjs-popup/dist/index.css";
import { FlexColumn, FlexRow } from "../lib/base-styles";
import { Text } from "../lib/components/Text";
export function Modal({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <StyledPopup
      closeOnDocumentClick={false}
      open={isOpen}
      position="right center"
      className="lh-modal"
      overlayStyle={{
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(10px)",
        zIndex: 99999,
        padding: "18px",
      }}
      contentStyle={{
        borderRadius: "20px",
        padding: "20px",
        boxSizing: "border-box",
        position: "relative",
        width: "100%",
        fontFamily: "inherit",
        transition: "all 0.3s ease-in-out",
        background: theme.colors.modalBackground,
        border: `1px solid ${theme.colors.border}`,
        maxHeight: "90%",
        maxWidth: 500
      }}
    >
      <StyledContent>
        <FlexRow className="lh-modal-header">
          <StyledHeader>
            {title && (
              <StyledTitle className="lh-modal-title">{title}</StyledTitle>
            )}
            {onClose && (
              <CloseButton onClick={onClose}>
                <X />
              </CloseButton>
            )}
          </StyledHeader>
        </FlexRow>
        {children}
      </StyledContent>
    </StyledPopup>
  );
}

const StyledContent = styled(FlexColumn)`
  gap: 0px;
`;

const StyledTitle = styled(Text)`
  font-size: 20px;
`;

const animation = keyframes`
     0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
`;

const StyledPopup = styled(Popup)`
  position: relative;
  &-content {
    -webkit-animation: ${animation} 0.3s forwards;
    animation: ${animation} 0.3s forwards;
  }

  &-overlay {
    -webkit-animation: ${animation} 0.3s forwards;
    animation: ${animation} 0.3s forwards;
  }
`;

const StyledHeader = styled(FlexRow)`
  width: 100%;
  margin-bottom: 30px;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textMain};
`;
