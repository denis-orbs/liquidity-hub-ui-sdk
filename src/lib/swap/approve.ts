import { maxUint256 } from "viem";
import Web3 from "web3";
import { swapAnalytics } from "../analytics";
import { permit2Address } from "../config/consts";
import { counter, getContract, sendAndWaitForConfirmations } from "../util";

export const approve = async (
  account: string,
  web3: Web3,
  chainId: number,
  fromToken: string
) => {
  const contract = getContract(fromToken, web3, chainId);
  if (!contract) {
    throw new Error("Contract not found");
  }

  const count = counter();

  try {
    swapAnalytics.onApprovalRequest();
    const tx = contract.methods.approve(permit2Address, maxUint256);

    await sendAndWaitForConfirmations(web3, chainId, tx, { from: account });
    swapAnalytics.onApprovalSuccess(count());
  } catch (error) {
    swapAnalytics.onApprovalFailed((error as any).message, count());
    throw new Error("Failed to approve");
  }
};
