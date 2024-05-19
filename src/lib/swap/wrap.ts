import Web3 from "web3";
import { swapAnalytics } from "../analytics";
import { useEstimateGasPrice } from "../hooks/useEstimateGasPrice";
import { counter, getContract, sendAndWaitForConfirmations } from "../util";

export const wrap = async (
  account: string,
  web3: Web3,
  chainId: number,
  fromTokeAddress: string,
  fromAmount: string,
  gas: ReturnType<typeof useEstimateGasPrice>,
) => {
  const fromTokenContract = getContract(fromTokeAddress);
  if (!fromTokenContract) {
    throw new Error("Contract not found");
  }
  const count = counter();
  swapAnalytics.onWrapRequest();

  try {
    const tx = fromTokenContract.methods.deposit();
    await sendAndWaitForConfirmations(web3, chainId, tx, {
      from: account,
      value: fromAmount,
      maxFeePerGas: gas?.data?.maxFeePerGas,
      maxPriorityFeePerGas: gas?.data?.priorityFeePerGas,
    });

    swapAnalytics.onWrapSuccess(count());
    return true;
  } catch (error) {
    swapAnalytics.onWrapFailed((error as any).message, count());
    throw new Error("Failed to wrap");
  }
};
