import { useCallback } from 'react'
import { useRefreshBalancesAfterTx } from '../..';
import { useDexState } from '../../store/dex';

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

