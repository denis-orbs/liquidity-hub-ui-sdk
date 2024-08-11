import { eqIgnoreCase } from "@defi.org/web3-candies";
import { Token } from "../lib";

  
  export const findTokenInList = (tokens: Token[], addressOrSymbol: string) => {
    const res = tokens.find(
      (t) =>
        eqIgnoreCase(t.address, addressOrSymbol) || t.symbol === addressOrSymbol
    );
    return res;
  };
  