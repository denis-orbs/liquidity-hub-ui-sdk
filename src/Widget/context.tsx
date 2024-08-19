import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { styled } from "styled-components";
import { useAccount } from "wagmi";
import Web3 from "web3";
import {
  getChainConfig,
  Token,
  useAmountBN,
} from "../lib";
import { useAllowanceQuery } from "../lib/hooks/swap/useAllowanceQuery";
import { useInitialTokens } from "./hooks";
import { useProvider } from "./hooks/useProvider";
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
  fromAmountUi?: string;
  fetchingBalancesAfterTx?: boolean;
  txHash?: string;
}
interface ContenxtType {
  state: State;
  updateState: (payload: Partial<State>) => void;
  resetState: () => void;
  hasAllowance?: boolean;
  slippage?: number;
  account?: string;
  chainId?: number;
  web3?: Web3;
  chainConfig?: ReturnType<typeof getChainConfig>;
  provider?: any;
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
    return {
      ...state,
      fromAmountUi: undefined,
      showConfirmation: false,
      txHash: undefined,
    };
  }
  return state;
}

export const WidgetProvider = (props: ContextProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fromAmount = useAmountBN(state.fromToken?.decimals, state.fromAmountUi);
  const { address: account } = useAccount();

  const provider = useProvider();
  const chainId = provider?.chainId && Web3.utils.hexToNumber(provider.chainId);
  const web3 = useMemo(() => !provider ? undefined :  new Web3(provider), [provider])

  const updateState = useCallback(
    (payload: Partial<State>) => {
      dispatch({ type: "UPDATE_STATE", payload });
    },
    [dispatch]
  );

  const { data: hasAllowance } = useAllowanceQuery(
    account,
    web3,
    chainId,
    fromAmount,
    state.fromToken
  );  

  

  const resetState = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);




  const chainConfig = useMemo(() => getChainConfig(chainId), [chainId])
  return (

   
    <Context.Provider
      value={{
        state,
        updateState,
        resetState,
        hasAllowance,
        slippage: props.slippage,
        account,
        chainId,
        web3,
        chainConfig,
        provider

      }}
    >
      <Listener {...props} />
      <StyledContent>
      {props.children}
      </StyledContent>
     
    </Context.Provider>
  );
};

const Listener = (props: ContextProps) => {
  useInitialTokens(props.initialFromToken, props.initialToToken);

  return null;
};



const StyledContent = styled('div')({
 "*":{
  color:'white'
 }
})

