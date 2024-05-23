import { Network } from "../type";
import _ from "lodash";
import { networks } from "../networks";
import { api } from "../api";

const polygon: Network = {
  native: networks.poly.native,
  wToken: networks.poly.wToken,
  chainId: networks.poly.id,
  chainName: "Polygon",
  explorerUrl: "https://polygonscan.com",
  apiUrl: "https://polygon.hub.orbs.network",
};

const fanton: Network = {
  native: networks.ftm.native,
  wToken: networks.ftm.wToken,
  chainId: networks.ftm.id,
  chainName: "Fantom",
  explorerUrl: "https://ftmscan.com",
  apiUrl: "https://ftm.hub.orbs.network",
  getTokens: api.getFantomTokens,
};

const bsc: Network = {
  native: networks.bsc.native,
  wToken: networks.bsc.wToken,
  chainId: networks.bsc.id,
  chainName: "BSC",
  explorerUrl: "https://bscscan.com",
  apiUrl: "https://bsc.hub.orbs.network",
};

const zkEvm: Network = {
  native: networks.eth.native,
  wToken: {
    ...networks.eth.wToken,
    address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
  },
  chainId: 1101,
  chainName: "Polygon ZkEVM",
  explorerUrl: "https://zkevm.polygonscan.com",
  getTokens: api.getPolygonZkEvmTokens,
  apiUrl: "https://zkevm.hub.orbs.network",
};

const base: Network = {
  native: networks.base.native,
  wToken: networks.base.wToken,
  chainId: networks.base.id,
  chainName: "Base",
  explorerUrl: "https://basescan.org",
  apiUrl: "https://base.hub.orbs.network",
};

const linea: Network = {
  native: networks.linea.native,
  wToken: networks.linea.wToken,
  chainId: networks.linea.id,
  chainName: networks.linea.name,
  explorerUrl: networks.linea.explorer,
  apiUrl: "https://hub.orbs.network",
  getTokens: api.getLineaTokens,
};

export const supportedChains = {
  polygon,
  bsc,
  zkEvm,
  base,
  fanton,
  linea
};
