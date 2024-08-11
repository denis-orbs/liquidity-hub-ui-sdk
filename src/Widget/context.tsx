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
  useQuote,
} from "../lib";
import { useInitialTokens } from "./hooks";
import { useSubmitWidgetSwap } from "./useSubmitWidgetSwap";

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
  fromAmount?: string;
  toAmount?: string;
  fetchingBalancesAfterTx?: boolean;
}
interface ContenxtType {
  quote?: Quote;
  quoteLoading: boolean;
  quoteError: boolean;
  onSwapCallback: (quote?: Quote) => Promise<{ txHash: string; receipt: any }>;
  swapStatus: SwapStatus;
  swapStep: SwapSteps;
  isWrapped: boolean;
  state: State;
  updateState: (payload: Partial<State>) => void;
  resetState: () => void;
  onShowConfirmation: () => void;
  onCloseConfirmation: () => void;
  hasAllowance?: boolean;
  fromAmountRaw?: string;
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

  const fromAmountRaw = useAmountBN(
    state.fromToken?.decimals,
    state.fromAmount
  );

  const updateState = useCallback(
    (payload: Partial<State>) => {
      dispatch({ type: "UPDATE_STATE", payload });
    },
    [dispatch]
  );
  const {
    quote,
    isLoading: quoteLoading,
    isError: quoteError,
  } = useQuote({
    fromToken: state.fromToken,
    toToken: state.toToken,
    fromAmount: fromAmountRaw,
    slippage: props.slippage || 0.5,
  });

  const onCloseConfirmation = useCallback(() => {
    updateState({ showConfirmation: false });
  }, [updateState]);
  const { data: hasAllowance } = useAllowance(fromAmountRaw, state.fromToken);

  const {
    mutateAsync: onSwapCallback,
    swapStatus,
    swapStep,
    isWrapped,
  } = useSubmitWidgetSwap(
    fromAmountRaw,
    state.fromToken,
    state.toToken,
    hasAllowance
  );

  const resetState = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  const onShowConfirmation = useCallback(() => {
    updateState({ showConfirmation: true });
    if (quote) {
      updateState({ initialQuote: quote });
    }
  }, [quote, updateState]);

  return (
    <Context.Provider
      value={{
        quote,
        quoteLoading,
        quoteError,
        onSwapCallback,
        swapStatus,
        swapStep,
        isWrapped,
        state,
        updateState,
        resetState,
        onShowConfirmation,
        onCloseConfirmation,
        hasAllowance,
        fromAmountRaw,
      }}
    >
      <Listener />
      {props.children}
    </Context.Provider>
  );
};

const Listener = ({
  initialFromToken,
  initialToToken,
}: {
  initialFromToken?: string;
  initialToToken?: string;
}) => {
  useInitialTokens(initialFromToken, initialToToken);

  return null;
};
