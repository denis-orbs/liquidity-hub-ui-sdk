import { useCallback } from "react";
import { waitForTxDetails } from "../..";
import { useMainContext } from "../../context/MainContext";

export function useWaitForTxDetails() {
  const { web3 } = useMainContext();

  return useCallback(
    (txHash: string) => {
      if (!web3) {
        throw new Error("No web3 found");
      }
      return waitForTxDetails(web3, txHash);
    },
    [web3]
  );
}
