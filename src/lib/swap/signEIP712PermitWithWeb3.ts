import { _TypedDataEncoder } from "@ethersproject/hash";
import { swapAnalytics } from "../analytics";
import { PermitData } from "../type";
import { counter, isTxRejected, RejectedError } from "../util";



const signEIP712 = async (
  signer: string,
  web3: any,
  permitData: PermitData
) => {
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
  const provider = web3.givenProvider || web3.currentProvider;

  try {
    return await signAsync(signer, provider, "eth_signTypedData_v4", message);
  } catch (e: any) {
    if (isTxRejected(e.message)) {
      throw new RejectedError();
    }
    try {
      return await signAsync(signer, provider, "eth_signTypedData", message);
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
};

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

export const signEIP712PermitWithWeb3 = async (
  signer: string,
  web3: any,
  permitData: PermitData
) => {
  const count = counter();
  try {
    swapAnalytics.onSignatureRequest();

    const signature = await signEIP712(signer, web3, permitData);
    if (!signature) {
      throw new Error("No signature");
    }
    swapAnalytics.onSignatureSuccess(signature, count());
    return signature as string;
  } catch (error) {
    swapAnalytics.onSignatureFailed((error as any).message, count());
    throw error;
  }
};
