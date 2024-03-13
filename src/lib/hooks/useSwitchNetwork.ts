import { useMutation } from "@tanstack/react-query";
import Web3 from "web3";
import { useMainContext } from "../provider";
import { network } from "../util";

export const useSwitchNetwork = () => {
  const { web3 } = useMainContext();
  return useMutation({
    mutationFn: async (chainId: number) => {
      if (!web3) return;
      const provider = (web3 as any).provider || web3.currentProvider;
      if (!provider) throw new Error(`no provider`);

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: Web3.utils.toHex(chainId) }],
        });
      } catch (error: any) {
        // if unknown chain, add chain
        if (error.code === 4902) {
          const info = network(chainId);
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: Web3.utils.toHex(chainId),
                chainName: info.name,
                nativeCurrency: info.native,
                rpcUrls: [info.publicRpcUrl],
                blockExplorerUrls: [info.explorer],
                iconUrls: [info.logoUrl],
              },
            ],
          });
        } else throw error;
      }
    },
  });
};
