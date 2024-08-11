import { _TypedDataEncoder } from "@ethersproject/hash";
import { useCallback } from "react";
import { swapAnalytics } from "../../analytics";
import { useMainContext } from "../../context/MainContext";
import { PermitData } from "../../type";
import { counter, isTxRejected } from "../../util";


export function useSignEIP712() {
    const { provider, web3, account: signer } = useMainContext();
    return useCallback(
      async (permitData: PermitData) => {
        if (!provider || !web3 || !signer) {
          throw new Error("No provider, web3 or signer found");
        }
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
          return await signAsync(
            signer,
            provider,
            "eth_signTypedData_v4",
            message
          );
        } catch (e: any) {
          if (isTxRejected(e)) {
            throw e;
          }
          try {
            return await signAsync(
              signer,
              provider,
              "eth_signTypedData",
              message
            );
          } catch (error: any) {
            if (
              typeof error.message === "string" &&
              (error.message.match(/not (found|implemented)/i) ||
                error.message.match(/TrustWalletConnect.WCError error 1/) ||
                error.message.match(/Missing or invalid/))
            ) {
              throw new Error("Wallet does not support EIP-712");
            } else {
              throw error;
            }
          }
        }
      },
      [provider, web3, signer]
    );
  }
  
  async function signAsync(
    signer: string,
    provider: any,
    method: "eth_signTypedData_v4" | "eth_signTypedData",
    message: string
  ) {
    try {
      return await provider?.request({
        method,
        params: [signer, message],
      });
    } catch (error) {
      throw error;
    }
  }

  
export const useSignCalback = () => {
    const signEIP712 = useSignEIP712();
  
    return useCallback(
      async (permitData: PermitData) => {
        const count = counter();
        try {
          swapAnalytics.onSignatureRequest();
  
          const signature = await signEIP712(permitData);
          if (!signature) {
            throw new Error("No signature");
          }
          swapAnalytics.onSignatureSuccess(signature, count());
          return signature;
        } catch (error) {
          swapAnalytics.onSignatureFailed((error as any).message, count());
          throw new Error((error as Error)?.message);
        }
      },
      [signEIP712]
    );
  };
  