import { useEffect } from "react";
import { useLiquidityHubPersistedStore } from "../store/main";
import { LH_CONTROL } from "../type";

export function useLhControllListener() {
  const search = new URLSearchParams(window.location.search);
  const setLHControl = useLiquidityHubPersistedStore((s) => s.setLHControl);

  useEffect(() => {
    const lhControl = search.get("lh-control");

    if (!lhControl) return;

    if (lhControl in LH_CONTROL) {
      setLHControl(lhControl as LH_CONTROL);
    }
  }, [search, setLHControl]);
}
