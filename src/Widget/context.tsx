import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  Quote,
  SwapStatus,
  SwapSteps,
  Token,
  useAllowance,
  useAmountBN,
} from "../lib";
import { useInitialTokens } from "./hooks";

const Context = createContext({} as ContenxtType);

export const useWidgetContext = () => {
  if (!Context) {
    throw new Error(
      "useWidgetContext must be used within a WidgetContextProvider"
    );
  }
  return useContext(Context);
};

interface ContextProps {
  children: ReactNode;
  initialFromToken?: string;
  initialToToken?: string;
  slippage?: number;
}

interface State {
  fromToken?: Token;
  toToken?: Token;
  showConfirmation?: boolean;
  initialQuote?: Quote;
  fromAmountUi?: string;
  toAmount?: string;
  fetchingBalancesAfterTx?: boolean;
  swapStatus?: SwapStatus;
  swapStep?: SwapSteps;
  isWrapped?: boolean;
}
interface ContenxtType {
  state: State;
  updateState: (payload: Partial<State>) => void;
  resetState: () => void;
  hasAllowance?: boolean;
  slippage?: number;
}

const initialState: State = {};

type Action =
  | { type: "UPDATE_STATE"; payload: Partial<State> }
  | { type: "RESET" };

function reducer(state: State, action: Action) {
  if (action.type === "UPDATE_STATE") {
    return { ...state, ...action.payload };
  }
  if (action.type === "RESET") {
    return initialState;
  }
  return state;
}

export const WidgetProvider = (props: ContextProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fromAmount = useAmountBN(state.fromToken?.decimals, state.fromAmountUi);

  const updateState = useCallback(
    (payload: Partial<State>) => {
      dispatch({ type: "UPDATE_STATE", payload });
    },
    [dispatch]
  );

  const { data: hasAllowance } = useAllowance(fromAmount, state.fromToken);

  const resetState = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  return (
    <Context.Provider
      value={{
        state,
        updateState,
        resetState,
        hasAllowance,
        slippage: props.slippage,
      }}
    >
      <Listener {...props} />
      {props.children}
    </Context.Provider>
  );
};

const Listener = (props: ContextProps) => {
  useInitialTokens(props.initialFromToken, props.initialToToken);

  return null;
};
