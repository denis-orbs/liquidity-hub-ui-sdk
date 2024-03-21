import { useDebounce } from "./useDebounce";

export function useDebounedFromAmount(fromAmount?: string) {
  return useDebounce(fromAmount, !fromAmount ? 0 : 3_00);
}
