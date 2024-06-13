import { useMutation } from "@tanstack/react-query";
import { useMainContext } from "../provider";
import { wrap } from "../swap/wrap";
import { useEstimateGasPrice } from "./useEstimateGasPrice";

export const useWrap = () => {
  const { account, web3, chainId } = useMainContext();
  const gas = useEstimateGasPrice();

  return useMutation({
    mutationFn: async ({
      fromTokenAddress,
      fromAmount,
    }: {
      fromTokenAddress?: string;
      fromAmount?: string;
      onSuccess?: () => void;
    }) => {
      if (
        !account ||
        !web3 ||
        !chainId ||
        !gas ||
        !fromTokenAddress ||
        !fromAmount
      ) {
        throw new Error("No account, web3, chainId or gas found");
      }
      return wrap({
        account,
        web3,
        chainId,
        tokenAddress: fromTokenAddress,
        fromAmount,
        gas,
      });
    },
    onSuccess: (_, args) => {
      args.onSuccess?.();
    },
  });
};
