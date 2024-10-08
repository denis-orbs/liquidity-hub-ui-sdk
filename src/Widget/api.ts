import _  from "lodash";
import BN from "bignumber.js";
import { create } from "zustand";
import { getChainConfig, Token } from "../lib";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";

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
    return 0;
  }
}

export async function fetchPrice(
  tokenAddress: string,
  chainId: number
): Promise<number> {
  try {
    const payload = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}/`
    );

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

interface TokenListStore {
  tokens: any[];
  setTokens: (tokens: any[]) => void;
}

const useTokensStore = create<TokenListStore>((set) => ({
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
}));

const getTokens = async (chainId: number): Promise<Token[]> => {
  const config = getChainConfig(chainId);
  let _tokens = useTokensStore.getState().tokens;
  if (!_.size(_tokens)) {
    const payload = await fetch(
      "https://lhthena.s3.us-east-2.amazonaws.com/uniswap-list.json"
    );
    const res = await payload.json();
    _tokens = res.tokens;
    useTokensStore.getState().setTokens(_tokens);
  }

  const tokens = _tokens.filter((it: any) => it.chainId === chainId);


  let  base = []

  try {
    base =  Object.values(erc20s[config?.shortname as any]).map((t: any) => t().address);
  } catch (error) {
    
  }


  const baseAssets = [zeroAddress, ...base];
  const native = _.find(networks, (it) => it.id === chainId)?.native;

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
  let payload = await fetch(
    "https://unpkg.com/quickswap-default-token-list@1.3.21/build/quickswap-default.tokenlist.json"
  );
  const res = await payload.json();

  const native = {
    ...networks.zkevm.wToken,
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

const getFantomTokens = async (): Promise<Token[]> => {
  const res = await fetch(
    "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ftm.json"
  );
  const data = await res.json();
  return data.map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
      name: token.name,
    };
  });
};

const getLineaTokens = async (): Promise<Token[]> => {
  const tokens = await fetch("https://api.lynex.fi/api/v1/assets")
    .then((res) => res.json())
    .then((res) => res.data);
  return tokens.map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
      name: token.name,
    };
  });
};

const getBlastTokens = async (): Promise<Token[]> => {
  const tokens = await fetch("https://token-list.sushi.com/").then((res) =>
    res
      .json()
      .then((it) =>
        it.tokens.filter((it: any) => it.chainId === networks.blast.id)
      )
  );

  const _tokens = _.map(tokens, (token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
      name: token.name,
    };
  });

  const native = _.find(networks, (it) => it.id === networks.blast.id)?.native;

  if (native) {
    _tokens.unshift(native as any);
  }

  return _tokens;
};

export const getTokensByChainId = async (chainId: number): Promise<Token[]> => {
  switch (chainId) {
    case networks.zkevm.id:
      return getPolygonZkEvmTokens();
    case networks.ftm.id:
      return getFantomTokens();
    case networks.linea.id:
      return getLineaTokens();
    case networks.blast.id:
      return getBlastTokens();

    default:
      return getTokens(chainId);
  }
};

export const api = {
  priceUsd: fetchPrice,
  getTokensByChainId,
};
