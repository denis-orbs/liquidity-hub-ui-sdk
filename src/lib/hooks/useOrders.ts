import { useLiquidityHubPersistedStore } from "../store/main";
import { useMainContext } from "../provider";

export const useOrders = () => {
  const { account, chainId } = useMainContext();
  const orders = useLiquidityHubPersistedStore((s) => s.orders);

  if(!account || !chainId) return null;
  
  return orders?.[account]?.[chainId]
};