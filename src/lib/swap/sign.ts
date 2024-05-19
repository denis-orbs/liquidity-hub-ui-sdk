import { _TypedDataEncoder } from "@ethersproject/hash";
import Web3 from "web3";
import { swapAnalytics } from "../analytics";
import { PermitData } from "../type";
import { counter } from "../util";

export const sign = async (
  account: string,
  web3: Web3,
  provider: any,
  permitData: PermitData
) => {
  const count = counter();
  try {
    swapAnalytics.onSignatureRequest();

    const signature = await signEIP712(account, web3,provider,  permitData);
    if (!signature) {
      throw new Error("No signature");
    }
    swapAnalytics.onSignatureSuccess(signature, count());
    return signature;
  } catch (error) {
    swapAnalytics.onSignatureFailed((error as any).message, count());
    throw error;
  }
};

async function signEIP712(
  signer: string,
  web3: Web3,
  provider: any,
  permitData: PermitData
) {
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
    return await signAsync(signer,provider, "eth_signTypedData_v4", message);
  } catch (e: any) {
    console.log(e);

    if (e.message?.toLowerCase()?.includes("denied" || "rejected")) {
      throw new Error("User denied signature");
    }
    try {
      return await signAsync(signer,provider,"eth_signTypedData", message);
    } catch (error: any) {
      console.log(error);
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
