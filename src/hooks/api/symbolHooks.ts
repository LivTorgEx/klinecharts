import { useMemo } from 'react';
import type { SymbolType } from '../types/client/symbol';

export function useSymbol(id?: number): SymbolType | undefined {
  // stub: return undefined or minimal symbol
  return undefined;
}

export function useSymbols() {
  return [] as SymbolType[];
}

export function useSymbolFromAll(id?: number) {
  return useSymbol(id);
}

export function useSymbolsAll() {
  return useSymbols();
}
