import { ContractCallContext, Multicall } from "ethereum-multicall";
import Web3 from "web3";
import ERC20Abi from "./abi/ERC20Abi.json";
import { Balances, Token } from "./type";
import { amountUi, isNativeAddress } from "./util";
import BN from "bignumber.js";
import _ from "lodash";
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
      balances[native.address] = amountUi(native.decimals, new BN(nativeBalance));
    }
  
    try {
      _.forEach(results.results, (value: any) => {
        if (!value) return "0";
        const result = value.callsReturnContext[0]?.returnValues[0]?.hex;
        if (!result) return "0";
  
        const token = (value.originalContractCallContext as any).token;
  
        balances[token.address] = amountUi(token.decimals, new BN(result));
      });
    } catch (error) {
      console.log(error);
    }
  
    const res = tokens.map((token) => {
      return {
        address: token.address,
        balance: balances[token.address] || "0",
      };
    });
  
    return _.mapValues(_.keyBy(res, "address"), "balance");
  };