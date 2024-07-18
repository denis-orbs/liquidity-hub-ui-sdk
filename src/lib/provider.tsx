import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, lightTheme } from "./theme";
import { SDKProps } from "./type";
import { useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { ForceIndicator } from "./components/ForceIndicator";
import { MainContextProvider } from "./context/MainContext";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const LiquidityHubProvider = (props: SDKProps) => {
  const {children, ...rest} = props;
  const _theme = useMemo(() => {
    if (props.theme === "light") {
      return lightTheme;
    }
    return darkTheme;
  }, [props.theme]);

  return (
    <QueryClientProvider client={client}>
      <MainContextProvider {...rest}>
        <ThemeProvider theme={_theme}>
          <ForceIndicator />
          {children}
        </ThemeProvider>
      </MainContextProvider>
    </QueryClientProvider>
  );
};
