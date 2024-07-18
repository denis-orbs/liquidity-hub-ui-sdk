import { useContractCallback } from "./useContractCallback";
import BN from "bignumber.js";
import { Logger, sendAndWaitForConfirmations } from "../util";
import { zeroAddress } from "../config/consts";
import { useEstimateGasPrice } from "./useEstimateGasPrice";
import { useMutation } from "@tanstack/react-query";
import { useMainContext } from "../context/MainContext";

export const useUnwrap = () => {
  const { account, web3, chainId } = useMainContext();
  const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useMutation({
    mutationFn: async ({fromAmount}:{fromAmount: string, onSuccess?: () => void}) => {

      try {
        const fromTokenContract = getContract(zeroAddress);

        if (!account || !fromTokenContract || !chainId || !web3) {
          throw new Error("Missing account");
        }
        const tx = fromTokenContract.methods.withdraw(
          new BN(fromAmount).toFixed(0)
        );
        await sendAndWaitForConfirmations({
          web3,
          chainId,
          tx,
          opts: {
            from: account,
            maxFeePerGas: gas?.maxFeePerGas,
            maxPriorityFeePerGas: gas?.priorityFeePerGas,
          },
        });

        return true;
      } catch (error: any) {
        Logger({ error });

        throw new Error(error.message);
      }
    },
    onSuccess: (_, args) => {
      args.onSuccess?.()
    }
  });
};
