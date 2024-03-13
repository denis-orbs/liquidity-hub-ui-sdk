
import styled from "styled-components";

interface Props {

    className?: string;
    icon: React.ReactNode;
    onClick?: () => void;

}

export function IconButton(props: Props) {
  return (
    <Button className={props.className || ""} onClick={props.onClick}>
      {props.icon}
    </Button>
  );
}



const Button = styled.button`

`