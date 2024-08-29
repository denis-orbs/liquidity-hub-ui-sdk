import { styled } from "styled-components";
import { useSwapConfirmationContext } from "../context";
import { TradeContainer } from "../TradeContainer";
import { ExplorerLink } from "../../ExplorerLink";
import { Check } from "react-feather";
import { OrbsLogo } from "../../OrbsLogo";
import { Text } from "../../Text";
import { FlexColumn } from "../../../base-styles";
import { Link } from "../../Link";

export function SuccessContent() {
  return (
    <TradeContainer
      variant="success"
      topElement={
        <StyledCheck>
          <Check />
        </StyledCheck>
      }
      title={<Title />}
      bottomElement={<TxHash />}
    />
  );
}

const Title = () => {
  return (
    <StyledTitle>
      <Text>Swap success Using</Text>
      <Text>
        <Link url="https://www.orbs.com/liquidity-hub/">Liquidity Hub </Link>
        by{" "}
        <Link url="https://www.orbs.com/">
          Orbs <OrbsLogo />
        </Link>
      </Text>
    </StyledTitle>
  );
};

const StyledTitle = styled(FlexColumn)({
  gap: 5,
  alignItems: "center",
  ".lh-logo": {
    position: "relative",
    top: 3,
    width: 18,
    height: 18,
  },
  p: {
    fontSize: 16,
  },
});

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
