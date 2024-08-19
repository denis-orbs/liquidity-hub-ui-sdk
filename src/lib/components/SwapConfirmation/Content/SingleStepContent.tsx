import { ExplorerLink } from "../../ExplorerLink";
import { Spinner } from "../../Spinner";
import { StyledSwapTitle } from "../Components";
import { useSwapConfirmationContext } from "../context";
import { TradeContainer } from "../TradeContainer";

export function SingleStepContent() {
  return (
    <TradeContainer
      variant="pending"
      topElement={<Spinner size={50} borderWidth={5} />}
      title={<Title />}
      bottomElement={<BottomContent />}
    />
  );
}

const BottomContent = () => {
  const { txHash, chainId } = useSwapConfirmationContext();

  if (!txHash) {
    return <>Proceed in wallet</>;
  }

  return <ExplorerLink chainId={chainId} txHash={txHash} />;
};

const Title = () => {
  const { txHash } = useSwapConfirmationContext();

  return (
    <StyledSwapTitle>
      {txHash ? "Transaction pending" : "Confirm swap"}
    </StyledSwapTitle>
  );
};
