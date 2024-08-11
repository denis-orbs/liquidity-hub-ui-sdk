import { ReactNode } from "react";
import Popup from "reactjs-popup";
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
    <Popup open={open} onClose={onClose}>
      {children}
    </Popup>
  );
};
