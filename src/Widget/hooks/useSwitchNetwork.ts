import { network } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import Web3 from "web3";
import { useWidgetContext } from "../context";

export const useSwitchNetwork = () => {
  const { provider } = useWidgetContext();
  return useMutation({
    mutationFn: async (chainId: number) => {
      if (!provider) throw new Error(`no provider`);

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: Web3.utils.toHex(chainId) }],
        });
      } catch (error: any) {
        alert(error.message);
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
