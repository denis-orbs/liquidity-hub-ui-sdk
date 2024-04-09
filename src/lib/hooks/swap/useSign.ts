import { useSwapState } from "../../store/main";
import { PermitData, STEPS } from "../../type";
import { useCallback } from "react";
import { useMainContext } from "../../provider";
import { counter } from "../../util";
import { swapAnalytics } from "../../analytics";
import { _TypedDataEncoder } from "@ethersproject/hash";

export const useSign = () => {
  const { account, web3 } = useMainContext();
  const updateState = useSwapState((s) => s.updateState);
  const signEIP712 = useSignEIP712();
  return useCallback(
    async (permitData: any) => {
      updateState({ swapStatus: "loading", currentStep: STEPS.SEND_TX });
      const count = counter();
      try {
        if (!account || !web3) {
          throw new Error("No account or web3");
        }
        swapAnalytics.onSignatureRequest();

        const signature = await signEIP712(permitData);
        if (!signature) {
          throw new Error("No signature");
        }
        swapAnalytics.onSignatureSuccess(signature, count());
        updateState({ isSigned: true });
        return signature;
      } catch (error) {
        swapAnalytics.onSignatureFailed((error as any).message, count());
        throw error;
      }
    },
    [updateState, account, web3]
  );
};



export function useSignEIP712() {
  const { account: signer, web3 } = useMainContext();
  const signAsync = useSignAsync();
  return useCallback(
    async (permitData: PermitData) => {
      if (!signer || !web3) return;

      const populated = await _TypedDataEncoder.resolveNames(
        permitData.domain,
        permitData.types,
        permitData.values,
        async (name: string) => (await web3.eth.ens.getAddress(name)).toString()
      );

      const message = JSON.stringify(
        _TypedDataEncoder.getPayload(
          populated.domain,
          permitData.types,
          populated.value
        )
      );

      try {
        return await signAsync("eth_signTypedData_v4", message);
      } catch (e: any) {
        try {
          return await signAsync("eth_signTypedData", message);
        } catch (error: any) {
          if (
            typeof error.message === "string" &&
            (error.message.match(/not (found|implemented)/i) ||
              error.message.match(/TrustWalletConnect.WCError error 1/) ||
              error.message.match(/Missing or invalid/))
          ) {
            console.log(
              "signTypedData: wallet does not implement EIP-712, falling back to eth_sign",
              error.message
            );
            throw new Error("Wallet does not support EIP-712");
          }
        }
      }
    },
    [signer, web3, signAsync]
  );
}

export function useSignAsync() {
  const { account: signer, provider } = useMainContext();

  return useCallback(
    async (
      method: "eth_signTypedData_v4" | "eth_signTypedData",
      message: string
    ) => {
      try {
        return await provider?.request({
          method,
          params: [signer, message],
        });
      } catch (error) {
        throw error;
      }
    },
    [signer, provider]
  );
}
