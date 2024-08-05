import { _TypedDataEncoder } from "@ethersproject/hash";
import { useCallback } from "react";
import { useMainContext } from "../context/MainContext";
import { PermitData } from "../type";
import { isTxRejected, Logger } from "../util";

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
            Logger(
              "signTypedData: wallet does not implement EIP-712, falling back to eth_sign"
            );
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
