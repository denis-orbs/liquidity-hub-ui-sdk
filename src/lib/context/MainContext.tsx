import { QueryKey } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import Web3 from "web3";
import {
  ActionStatus,
  ProviderArgs,
  SDKProps,
  STEPS,
  Token,
} from "..";
import { swapAnalytics } from "../analytics";
import { useLhControllListener } from "../hooks/useLhControllListener";

interface State {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  sessionId?: string;
  dexMinAmountOut?: string;
  swapStatus?: ActionStatus;
  currentStep?: STEPS;
  swapError?: string;
  failures?: number;
  txHash?: string;
  isWrapped?: boolean;
  isSigned?: boolean;
  approveTxHash?: string;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  quoteCount?: number;
  showConfirmation?: boolean;
  quoteQueryKey?: QueryKey;
  slippage?: number;
}

interface ContextArgs extends  ProviderArgs {
  web3?: Web3;
  updateState: (payload: Partial<State>) => void;
  state: State;
}

const Context = createContext({} as ContextArgs);

const initialState = {};

type Action = { type: "UPDATE_STATE"; payload: Partial<State> };

function reducer(state: State, action: Action) {
  if (action.type === "UPDATE_STATE") {
    return { ...state, ...action.payload };
  }
  return state;
}

export const MainContextProvider = (props: SDKProps) => {
  const { children, ...rest } = props;
  const { partner, provider, chainId } = rest;
  const [state, dispatch] = useReducer(reducer, initialState);
  useLhControllListener();

  const web3 = useMemo(
    () => (provider ? new Web3(provider) : undefined),
    [provider]
  );

  const updateState = useCallback(
    (payload: Partial<State>) => {
      console.log({ payload });

      dispatch({ type: "UPDATE_STATE", payload });
    },
    [dispatch]
  );

  useEffect(() => {
    if (chainId && partner) {
      swapAnalytics.setChainId(chainId);
      swapAnalytics.setPartner(partner);
    }
  }, [chainId, partner]);

  return (
    <Context.Provider value={{ ...rest, web3, updateState, state }}>
      {children}
    </Context.Provider>
  );
};

export const useMainContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useMainContext must be used within a LHProvider");
  }
  return context;
};
