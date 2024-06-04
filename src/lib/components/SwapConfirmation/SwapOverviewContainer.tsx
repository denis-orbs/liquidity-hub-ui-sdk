import { useSwapConfirmationContext } from "./context";

export function SwapOverviewContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const swapStatus = useSwapConfirmationContext().swapStatus
  if (swapStatus) return null;

  return <>{children}</>;
}
