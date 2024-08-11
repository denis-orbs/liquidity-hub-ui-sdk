import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SDKProps } from "./type";
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


  return (
    <QueryClientProvider client={client}>
      <MainContextProvider {...rest}>
          <ForceIndicator />
          {children}

      </MainContextProvider>
    </QueryClientProvider>
  );
};
