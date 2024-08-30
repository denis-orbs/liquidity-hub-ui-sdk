import Web3 from "web3";
import { swapAnalytics } from "../analytics";
import { maxUint256, permit2Address } from "../config/consts";
import { useEstimateGasPrice } from "../hooks/useEstimateGasPrice";
import { counter, getContract, sendAndWaitForConfirmations } from "../util";

export const approve = async ({
  account,
  web3,
  chainId,
  fromToken,
  gas,
  onTxHash,
  fromAmount,
  approveExactAmount
}: {
  account: string;
  web3: Web3;
  chainId: number;
  fromToken: string;
  gas: ReturnType<typeof useEstimateGasPrice>;
  onTxHash: (txHash: string) => void;
  fromAmount: string;
  approveExactAmount?: boolean;
}) => {
  const contract = getContract(fromToken, web3, chainId);
  if (!contract) {
    throw new Error("Contract not found");
  }

  const count = counter();
  const amountToApprove = approveExactAmount ? fromAmount : maxUint256;
  try {
    swapAnalytics.onApprovalRequest();
    const tx = contract.methods.approve(permit2Address, amountToApprove);

    await sendAndWaitForConfirmations({
      web3,
      chainId,
      tx,
      opts: {
        from: account,
        maxFeePerGas: gas?.data?.maxFeePerGas,
        maxPriorityFeePerGas: gas?.data?.priorityFeePerGas,
      },
      onTxHash
    });
    swapAnalytics.onApprovalSuccess(count());
  } catch (error) {
    swapAnalytics.onApprovalFailed((error as any).message, count());
    throw error;
  }
};
