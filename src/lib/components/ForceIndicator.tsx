import { useLiquidityHubPersistedStore } from "../store/main";
import { LH_CONTROL } from "../type";
import styled from "styled-components";
import { Text } from "./Text";
import { LH_CONTROL_PARAM } from "../config/consts";
export function ForceIndicator() {
  const { lhControl, setLHControl } = useLiquidityHubPersistedStore((s) => ({
    lhControl: s.lhControl,
    setLHControl: s.setLHControl,
  }));
  const isForce = lhControl === LH_CONTROL.FORCE;

  const onClick = () => {
    setLHControl(undefined);
    const search = window.location.search;
    const params = new URLSearchParams(search);
    params.delete(LH_CONTROL_PARAM);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  if (!isForce) return null;

  return (
    <Continer>
      <Light />
      <StyledText>LH Force mode on</StyledText>
      <Button onClick={onClick}>
        <Text>Reset</Text>
      </Button>
    </Continer>
  );
}

const StyledText = styled(Text)`
  font-size: 16px;
  font-weight: 600;
`;

const Button = styled.button`
  color: white;
  border: none;
  background-color: #ff0000;
  border-radius: 10px;
  padding: 5px 10px;
  cursor: pointer;
  margin-left: 10px;
  p{
    font-size: 14px;
  }
`;

const Light = styled.div`
  background-color: green;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 5px;
`;

const Continer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0px;
  margin-bottom: 30px;
`;
