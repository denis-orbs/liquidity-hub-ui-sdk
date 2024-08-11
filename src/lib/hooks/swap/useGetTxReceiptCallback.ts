import { useCallback } from "react";
import { waitForTxDetails } from "../..";
import { useMainContext } from "../../context/MainContext";

export function useGetTxReceiptCallback() {
  const { web3 } = useMainContext();

  return useCallback(
    async (txHash: string) => {
      if (!web3) {
        throw new Error("No web3 found");
      }
      const res = await waitForTxDetails(web3, txHash);
      if (!res?.mined) {
        throw new Error(res?.revertMessage);
      }

      return {
        receipt: res?.receipt,
        txHash,
      };
    },
    [web3]
  );
}
