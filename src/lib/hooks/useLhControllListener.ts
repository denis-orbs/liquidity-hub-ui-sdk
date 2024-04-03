import { useEffect } from "react";
import { DEBUG_PARAM, LH_CONTROL_PARAM } from "../config/consts";
import { useLiquidityHubPersistedStore } from "../store/main";
import { LH_CONTROL } from "../type";

export function useLhControllListener() {
  const { setLHControl, setDebug } = useLiquidityHubPersistedStore((s) => ({
    setLHControl: s.setLHControl,
    setDebug: s.setDebug,
  }));

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const lhControl = search.get(LH_CONTROL_PARAM);
    if (lhControl) {
      setLHControl(lhControl as LH_CONTROL);
    }
    if (search.get(DEBUG_PARAM)) {
      setDebug(true);
    }
  }, [setDebug, setLHControl]);
}
