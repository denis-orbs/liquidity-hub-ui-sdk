import styled from "styled-components";

export interface Props {
  value?: any;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  type?: string;
}
export function TextInput(props: Props) {
  return (
    <StyledInput
      value={props.value}
      onChange={props.onChange}
      className={props.className || ""}
      placeholder={props.placeholder}
      name={props.name}
      type={props.type}
    />
  );
}

const StyledInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  width: 100%;
  margin-bottom: 10px;
  outline: none;
  color: ${({ theme }) => theme.colors.textMain};
  background: transparent;
`;
