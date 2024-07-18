import { useQuery } from "@tanstack/react-query";
import { useMainContext } from "../context/MainContext";
import { isNativeAddress } from "../util";
import { useContract } from "./useContractCallback";

export function useTokenBalance(tokenAddress?: string) {
  const { web3, account, chainId } = useMainContext();

  const contract = useContract(tokenAddress);

  return useQuery({
    queryKey: ["useTokenBalance", account, tokenAddress, chainId],
    queryFn: async () => {
      if (isNativeAddress(tokenAddress!)) {
        return  web3!.eth.getBalance(account!);
      }
      if (!contract) {
        return "0";
      }
      return  contract?.methods.balanceOf(account).call();
    },
    enabled: !!web3 && !!account && !!tokenAddress,
  });
}
