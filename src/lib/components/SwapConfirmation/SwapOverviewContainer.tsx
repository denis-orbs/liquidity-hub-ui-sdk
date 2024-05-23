import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../../store/main";

export function SwapOverviewContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const swapStatus = useSwapState(useShallow((s) => s.swapStatus));
  if (swapStatus) return null;

  return <>{children}</>;
}
