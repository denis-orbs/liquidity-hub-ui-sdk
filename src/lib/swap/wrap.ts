import Web3 from "web3";
import { swapAnalytics } from "../analytics";
import { useEstimateGasPrice } from "../hooks/useEstimateGasPrice";
import { counter, getContract, sendAndWaitForConfirmations } from "../util";

export const wrap = async ({
  account,
  web3,
  chainId,
  tokenAddress,
  fromAmount,
  gas,
  onTxHash,
}: {
  account: string;
  web3: Web3;
  chainId: number;
  tokenAddress: string;
  fromAmount: string;
  gas: ReturnType<typeof useEstimateGasPrice>;
  onTxHash: (txHash: string) => void;
}) => {
  const fromTokenContract = getContract(tokenAddress, web3, chainId);

  if (!fromTokenContract) {
    throw new Error("Contract not found");
  }
  const count = counter();
  swapAnalytics.onWrapRequest();

  try {
    const tx = fromTokenContract.methods.deposit();
    await sendAndWaitForConfirmations({
      web3,
      chainId,
      tx,
      opts: {
        from: account,
        value: fromAmount,
        maxFeePerGas: gas?.data?.maxFeePerGas,
        maxPriorityFeePerGas: gas?.data?.priorityFeePerGas,
      },
      onTxHash,
    });

    swapAnalytics.onWrapSuccess(count());
    return true;
  } catch (error) {
    swapAnalytics.onWrapFailed((error as any).message, count());
    throw error;
  }
};
