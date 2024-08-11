import { ContractCallContext, Multicall } from "ethereum-multicall";
import Web3 from "web3";

import _ from "lodash";
import { isNativeAddress } from "@defi.org/web3-candies";
import { ERC20Abi, Token } from "../lib";
import { Balances } from "./types";
export const getBalances = async (
  tokens: Token[],
  web3?: Web3,
  account?: string
): Promise<Balances> => {
  if (!web3 || !account) {
    return {};
  }
  const native = tokens.find((it) => isNativeAddress(it.address));
  const erc20Tokens = tokens.filter((it) => !isNativeAddress(it.address));

  const contractCallContext: ContractCallContext[] = erc20Tokens.map(
    (token) => {
      return {
        reference: token.address,
        contractAddress: token.address as string,
        abi: ERC20Abi,
        token,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [account],
          },
        ],
      };
    }
  );

  const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });

  const [nativeBalance, results] = await Promise.all([
    (await web3.eth.getBalance(account)).toString(),
    multicall.call(contractCallContext),
  ]);

  const balances: { [key: string]: string } = {};

  if (native) {
    balances[native.address] = nativeBalance
  }

  try {
    _.forEach(results.results, (value: any) => {
      if (!value) return "0";
      const result = value.callsReturnContext[0]?.returnValues[0]?.hex;
      if (!result) return "0";

      const token = (value.originalContractCallContext as any).token;

      const balance = web3.utils.hexToNumberString(result);
      balances[token.address] = balance === "1" ? "0" : balance;
    });
  } catch (error) {
    console.error("getBalances error", error);
  }

  const res = tokens.map((token) => {
    return {
      address: token.address,
      balance: balances[token.address] || "0",
    };
  });

  return _.mapValues(_.keyBy(res, "address"), "balance");
};
