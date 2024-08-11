import { setWeb3Instance } from "@defi.org/web3-candies";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import Web3 from "web3";
import { ProviderArgs, SDKProps } from "..";
import { swapAnalytics } from "../analytics";
import { useLhControllListener } from "../hooks/useLhControllListener";

interface State {
  sessionId?: string;
  slippage?: number;
}

interface ContextArgs extends ProviderArgs {
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

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  const updateState = useCallback(
    (payload: Partial<State>) => {
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
