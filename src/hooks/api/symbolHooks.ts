import type { SymbolType } from "../../types/client/symbol";

export function useSymbol(id?: number): SymbolType | undefined {
  // stub: return undefined or minimal symbol
  void id;
  return undefined;
}

export function useSymbols(): { data: SymbolType[] } {
  return { data: [] };
}

export function useSymbolFromAll(id?: number) {
  return useSymbol(id);
}

export function useSymbolsAll(): { data: SymbolType[] } {
  return useSymbols();
}
