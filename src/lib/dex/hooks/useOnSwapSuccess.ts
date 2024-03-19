import { useCallback } from 'react'
import { useDexState } from '../../store/dex';
import { useRefreshBalancesAfterTx } from './useRefreshBalancesAfterTx';

export function useOnSwapSuccess() {
    const refetchBalances = useRefreshBalancesAfterTx();
    const resetDexState = useDexState((s) => s.onReserAfterSwap);

    return useCallback(
      () => {
        refetchBalances()
        resetDexState()
      },
      [refetchBalances, resetDexState],
    )
    
}

