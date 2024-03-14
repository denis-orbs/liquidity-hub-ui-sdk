import { useShallow } from "zustand/react/shallow";
import { useDebounce } from "../../hooks/useDebounce";
import { useDexState } from "../../store/dex";
import BN from "bignumber.js";
import { FROM_AMOUNT_DEBOUNCE } from "../../config/consts";

export function useDebouncedFromAmount() {
  const fromAmount = useDexState(useShallow((s) => s.fromAmount));

  const debouned = useDebounce(fromAmount, FROM_AMOUNT_DEBOUNCE);

  return BN(fromAmount || "0").isZero() ? fromAmount : debouned;
}
