import styled, { CSSObject } from "styled-components";
import { SwapConfirmationArgs, SwapStatus } from "../..";
import {
  SwapConfirmationProvider,
  useSwapConfirmationContext,
} from "./context";
import { SwapDetails } from "./Details";
import { StepsComponent } from "./Steps";
import { SwapFailed } from "./SwapFailed";
import { SwapSuccess } from "./SwapSuccess";
import { PoweredBy } from "./PoweredBy";
import { FlexColumn } from "../../base-styles";
import { Fragment, ReactNode, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { darkTheme, lightTheme } from "./theme";

interface Props extends SwapConfirmationArgs {
  className?: string;
  style?: CSSObject;
  SubmitButton?: ReactNode;
}

const SwapConfirmation = ({ className = "", style = {}, ...args }: Props) => {
  return (
    <SwapConfirmationProvider {...args}>
      <Container className={`${className} lh-summary`} $style={style}>
        <SwapConfirmationContent SubmitButton={args.SubmitButton} />
      </Container>
    </SwapConfirmationProvider>
  );
};

const SwapConfirmationContent = ({
  SubmitButton,
}: {
  SubmitButton?: ReactNode;
}) => {
  const { swapStatus, isLightMode } = useSwapConfirmationContext();
  const theme = useMemo(() => {
    if (isLightMode) {
      return lightTheme;
    }
    return darkTheme;
  }, [isLightMode]);

  return (
    <ThemeProvider theme={theme}>
      <Fragment>
        {swapStatus === SwapStatus.SUCCESS ? (
          <SwapSuccess />
        ) : swapStatus === SwapStatus.FAILED ? (
          <SwapFailed />
        ) : (
          <FlexColumn>
            <SwapDetails />
            <StepsComponent />
            {!swapStatus && SubmitButton}
          </FlexColumn>
        )}
        <PoweredBy style={{ marginTop: 30 }} />
      </Fragment>
    </ThemeProvider>
  );
};

const Container = styled.div<{ $style: CSSObject }>`
  width: 100%;
  * {
    box-sizing: border-box;
  }
  ${({ $style }) => $style}
`;

export { SwapConfirmation };
