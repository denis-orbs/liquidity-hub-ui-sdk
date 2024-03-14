import _ from "lodash";
import { zeroAddress } from "./config/consts";
import { supportedChains } from "./config/supportedChains";
import { networks } from "./networks";
import { Token } from "./type";
import { getBaseAssets } from "./util";
import BN from "bignumber.js";

async function fetchPriceParaswap(
  chainId: number,
  inToken: string,
  inTokenDecimals: number
) {
  const url = `https://apiv5.paraswap.io/prices/?srcToken=${inToken}&destToken=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&amount=${BN(
    `1e${inTokenDecimals}`
  ).toString()}&srcDecimals=${inTokenDecimals}&destDecimals=18&side=SELL&network=${chainId}`;
  try {
    const payload = await fetch(url);
    const res = await payload.json();
    return res.data.priceRoute.srcUSD;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

export async function fetchPrice(
  tokenAddress: string,
  chainId: number
): Promise<number> {
  try {
    const payload = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}/`);

    const data = await payload.json();

    if (!data.pairs[0]) {
      const paraPrice = await fetchPriceParaswap(
        chainId,
        tokenAddress,
        data.decimals
      );
      return paraPrice.price;
    }
    return parseFloat(data.pairs[0].priceUsd);
  } catch (e) {
    throw new Error(`fetchPrice: ${tokenAddress} failed`);
  }
}



const getTokens = async (chainId: number): Promise<Token[]> => {
    const payload = await fetch("https://tokens.uniswap.org/");
    const res = await payload.json();
  
    const tokens = res.tokens.filter((it: any) => it.chainId === chainId);
  
    const baseAssets = [zeroAddress, ...getBaseAssets(chainId)];
    const native = _.find(
      supportedChains,
      (it) => it.chainId === chainId
    )?.native;
  
    const sorted = _.sortBy(tokens, (t: any) => {
      const index = baseAssets.indexOf(t.address);
      return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
    });
  
    return [native, ...sorted].map((token: any) => {
      return {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        logoUrl: token.logoUrl || token.logoURI,
        name: token.name,
      };
    });
  };

    
  const getPolygonZkEvmTokens = async (): Promise<Token[]> => {
    let payload =  await fetch( "https://unpkg.com/quickswap-default-token-list@1.3.21/build/quickswap-default.tokenlist.json")
    const res = await payload.json();
    
    const native = {
      ...networks.eth.wToken,
      address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
    };
  
    const result = res.tokens
      .filter((it: any) => it.chainId === 1101)
      .map((it: any) => {
        return {
          address: it.address,
          symbol: it.symbol,
          decimals: it.decimals,
          logoUrl: it.logoURI,
        };
      });
    return [native, ...result];
  };
  



  const getPolygonTokens = async (): Promise<Token[]> => {
    const payload = await fetch(
      "https://unpkg.com/quickswap-default-token-list@1.3.16/build/quickswap-default.tokenlist.json"
    )
    const res = await payload.json();
    
    const tokens = res.tokens.filter((it: any) => it.chainId === 137);
  
    const sorted = _.sortBy(tokens, (t: any) => {
      const index = getBaseAssets(137).indexOf(t.address);
      return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
    });
  
    return [networks.poly.native, ...sorted].map((token: any) => {
      return {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        logoUrl:
          token.logoUrl || token.logoURI?.replace("/logo_24.png", "/logo_48.png"),
        name: token.name,
      };
    });
  };


  export const api = {
    getTokens,
    getPolygonZkEvmTokens,
    priceUsd: fetchPrice,
    getPolygonTokens
  }