import { styled } from "styled-components";
import { useSwapConfirmationContext } from "../context";
import { TradeContainer } from "../TradeContainer";
import { ExplorerLink } from "../../ExplorerLink";
import { Check } from "react-feather";

import { StyledSwapTitle } from "../Components";

export function TransactionPending() {
  return (
    <TradeContainer
      variant="success"
      topElement={
        <StyledCheck>
          <Check />
        </StyledCheck>
      }
      title={<StyledSwapTitle>Transaction pending</StyledSwapTitle>}
      bottomElement={<TxHash />}
    />
  );
}



const StyledCheck = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#53A654",
  width: 60,
  height: 60,
  borderRadius: "50%",
  svg: {
    color: "white",
    width: 37,
    height: 37,
  },
});

const TxHash = () => {
  const { txHash, chainId } = useSwapConfirmationContext();

  return <ExplorerLink chainId={chainId} txHash={txHash} />;
};
