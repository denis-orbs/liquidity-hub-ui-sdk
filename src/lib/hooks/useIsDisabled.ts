import { networks } from "@defi.org/web3-candies";
import _ from "lodash";
import { useMemo } from "react";
import { useMainContext } from "../context/MainContext";
import { useLiquidityHubPersistedStore } from "../store/main";
import { LH_CONTROL } from "../type";

export function useIsDisabled() {
  const context = useMainContext();
  const { liquidityHubEnabled, lhControl } = useLiquidityHubPersistedStore(
    (s) => ({
      liquidityHubEnabled: s.liquidityHubEnabled,
      lhControl: s.lhControl,
    })
  );

  const isValidChain = useMemo(() => {
    if (!context.chainId) return false;
    return _.map(networks, (it) => it.id).includes(context.chainId);
  }, [context.chainId]);

  return useMemo(() => {
    if (!isValidChain) return true;
    if (!liquidityHubEnabled) return true;
    if (lhControl === LH_CONTROL.SKIP) return true;
    return !liquidityHubEnabled;
  }, [lhControl, liquidityHubEnabled, isValidChain]);
}
