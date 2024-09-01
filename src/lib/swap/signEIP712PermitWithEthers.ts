import { _TypedDataEncoder } from "@ethersproject/hash";
import { swapAnalytics } from "../analytics";
import { PermitData } from "../type";
import { counter } from "../util";

export const signEIP712PermitWithEthers = async (
  signer: any,
  permitData: PermitData
) => {
  const count = counter();
  try {
    swapAnalytics.onSignatureRequest();

    const populated = await _TypedDataEncoder.resolveNames(
      permitData.domain,
      permitData.types,
      permitData.values,
      async (name: string) => name
    );

    const message = JSON.stringify(
      _TypedDataEncoder.getPayload(
        populated.domain,
        permitData.types,
        populated.value
      )
    );
    const signature = await signer._signTypedData(
      populated.domain,
      permitData.types,
      message
    );

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
