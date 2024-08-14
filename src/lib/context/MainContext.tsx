import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { ProviderArgs, SDKProps } from "..";
import { swapAnalytics } from "../analytics";
import { useLhControllListener } from "../hooks/useLhControllListener";

interface State {
  sessionId?: string;
  slippage?: number;
}

interface ContextArgs extends ProviderArgs {
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
  const { partner} = rest;
  const [state, dispatch] = useReducer(reducer, initialState);
  useLhControllListener();

  const updateState = useCallback(
    (payload: Partial<State>) => {
      dispatch({ type: "UPDATE_STATE", payload });
    },
    [dispatch]
  );

  useEffect(() => {
    if (partner) {
      swapAnalytics.setPartner(partner);
    }
  }, [partner]);

  return (
    <Context.Provider value={{ ...rest, updateState, state }}>
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
