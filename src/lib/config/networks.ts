import { Network, zeroAddress } from "..";
import { erc20sData } from "./erc20sData";

const ethereum: Network = {
  id: 1,
  name: "Ethereum",
  shortname: "eth",
  native: {
    address: zeroAddress,
    symbol: "ETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  wToken: erc20sData.eth.WETH,
  logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  explorer: "https://etherscan.io",
  apiUrl: "https://eth.hub.orbs.network",
  baseGasPrice: 3 * 1e9,
  eip1559: false,
  pendingBlocks: true,
  publicRpcUrl: "https://eth.llamarpc.com	",
};

const bsc: Network = {
  id: 56,
  name: "BinanceSmartChain",
  shortname: "bsc",
  native: {
    address: zeroAddress,
    symbol: "BNB",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/bsc_2.svg",
  },
  wToken: erc20sData.bsc.WBNB,
  logoUrl: "https://app.1inch.io/assets/images/network-logos/bsc_2.svg",
  explorer: "https://bscscan.com",
  apiUrl: "https://bsc.hub.orbs.network",
  baseGasPrice: 3 * 1e9,
  eip1559: false,
  pendingBlocks: true,
  publicRpcUrl: "https://bsc-dataseed.binance.org",
};

const poly: Network = {
  id: 137,
  name: "Polygon",
  shortname: "poly",
  native: {
    address: zeroAddress,
    symbol: "MATIC",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/polygon.svg",
  },
  wToken: erc20sData.poly.WMATIC,
  logoUrl: "https://app.1inch.io/assets/images/network-logos/polygon.svg",
  explorer: "https://polygonscan.com",
  apiUrl: "https://polygon.hub.orbs.network",
  baseGasPrice: 0,
  eip1559: true,
  pendingBlocks: true,
  publicRpcUrl: "https://polygon-rpc.com",

};

const ftm: Network = {
  id: 250,
  name: "Fantom",
  shortname: "ftm",
  native: {
    address: zeroAddress,
    symbol: "FTM",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/fantom.svg",
  },
  wToken: erc20sData.ftm.WFTM,
  logoUrl: "https://app.1inch.io/assets/images/network-logos/fantom.svg",
  explorer: "https://ftmscan.com",
  apiUrl: "https://ftm.hub.orbs.network",
  baseGasPrice: 0,
  eip1559: true,
  pendingBlocks: true,
  publicRpcUrl: "https://rpc.ftm.tools",

};

const base: Network = {
  id: 8453,
  name: "Base",
  shortname: "base",
  native: {
    address: zeroAddress,
    symbol: "ETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  wToken: erc20sData.base.WETH,
  logoUrl: "https://app.1inch.io/assets/images/network-logos/base.svg",
  explorer: "https://basescan.org",
  apiUrl: "https://base.hub.orbs.network",
  baseGasPrice: 0,
  eip1559: false,
  pendingBlocks: true,
  publicRpcUrl: "https://mainnet.base.org",

};

const linea: Network = {
  id: 59144,
  name: "Linea",
  shortname: "linea",
  native: {
    address: zeroAddress,
    symbol: "ETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  wToken: {
    address: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    symbol: "WETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  logoUrl: "https://s2.coinmarketcap.com/static/img/coins/128x128/27657.png",
  explorer: "https://lineascan.build",
  apiUrl: "https://linea.hub.orbs.network",
  baseGasPrice: 0,
  eip1559: false,
  pendingBlocks: true,
  publicRpcUrl: "https://linea.decubate.com	",
};
const blast: Network = {
  id: 81457,
  name: "Blast",
  shortname: "blast",
  native: {
    address: zeroAddress,
    symbol: "ETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  wToken: {
    address: "0x4300000000000000000000000000000000000004",
    symbol: "WETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  logoUrl:
    "https://assets.coingecko.com/coins/images/35494/standard/blast2.jpeg?1708919600",
  explorer: "https://blastexplorer.io",
  apiUrl: "https://blast.hub.orbs.network",
  baseGasPrice: 0,
  eip1559: false,
  pendingBlocks: true,
  publicRpcUrl: 'https://blast-rpc.publicnode.com	'
};

const polygonZkevm: Network = {
  id: 1101,
  name: "Polygon ZkEVM",
  shortname: "polygon-zkevm",
  native: {
    address: zeroAddress,
    symbol: "ETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  wToken: {
    address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
    symbol: "WETH",
    decimals: 18,
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
  },
  logoUrl:
    "https://assets.coingecko.com/coins/images/35494/standard/blast2.jpeg?1708919600",
  explorer: "https://zkevm.polygonscan.com",
  apiUrl: "https://zkevm.hub.orbs.network",
  baseGasPrice: 0,
  eip1559: true,
  pendingBlocks: true,
  publicRpcUrl:'https://polygon-zkevm.drpc.org	'
};

export const networks = {
  bsc,
  poly,
  ftm,
  base,
  linea,
  blast,
  polygonZkevm,
  ethereum
};
