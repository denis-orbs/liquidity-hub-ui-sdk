import { _TypedDataEncoder } from "@ethersproject/hash";
import Web3 from "web3";
import { swapAnalytics } from "../analytics";
import { PermitData } from "../type";
import { counter, isTxRejected, Logger } from "../util";

export const sign = async ({
  account,
  web3,
  provider,
  permitData,
}: {
  account: string;
  web3: Web3;
  provider: any;
  permitData: PermitData;
}) => {
  const count = counter();
  try {
    swapAnalytics.onSignatureRequest();

    const signature = await signEIP712(account, web3, provider, permitData);
    if (!signature) {
      throw new Error("No signature");
    }
    swapAnalytics.onSignatureSuccess(signature, count());
    return signature;
  } catch (error) {
    swapAnalytics.onSignatureFailed((error as any).message, count());
    throw new Error((error as Error)?.message);
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
    return await signAsync(signer, provider, "eth_signTypedData_v4", message);
  } catch (e: any) {
    if (isTxRejected(e)) {
      throw e;
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
        Logger(
          "signTypedData: wallet does not implement EIP-712, falling back to eth_sign"
        );
        throw new Error("Wallet does not support EIP-712");
      } else {
        throw error;
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
