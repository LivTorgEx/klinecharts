import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { SymbolType } from "../../types/client/symbol";
import { useKLineChartDataAdapter } from "../../context/dataAdapterContext";

export function useSymbols(can_trade = true, exchange_code?: string) {
  const adapter = useKLineChartDataAdapter();

  return useQuery({
    queryKey: ["Symbols", can_trade, exchange_code],
    queryFn: () =>
      adapter.loadSymbols({
        can_trade: can_trade ? true : undefined,
        exchange_code,
      }),
  });
}

export function useSymbolsAll(exchange_code?: string) {
  const adapter = useKLineChartDataAdapter();

  return useQuery({
    queryKey: ["Symbols", "all", exchange_code],
    queryFn: () => adapter.loadSymbols({ exchange_code }),
  });
}

function useSymbolsMap(symbols: SymbolType[]) {
  return useMemo(
    () =>
      symbols.reduce<Record<number, SymbolType>>((accumulator, symbol) => {
        accumulator[symbol.id] = symbol;
        return accumulator;
      }, {}),
    [symbols]
  );
}

function useSymbolsKeyMap(symbols: SymbolType[]) {
  return useMemo(
    () =>
      symbols.reduce<Record<string, SymbolType>>((accumulator, symbol) => {
        accumulator[symbol.symbol_key.toUpperCase()] = symbol;
        return accumulator;
      }, {}),
    [symbols]
  );
}

export function useSymbol(id?: number) {
  const { data: symbols = [] } = useSymbols();
  const symbolsMap = useSymbolsMap(symbols);

  return id !== undefined ? symbolsMap[id] : undefined;
}

export function useSymbolFromAll(id?: number) {
  const { data: symbols = [] } = useSymbolsAll();
  const symbolsMap = useSymbolsMap(symbols);

  return id !== undefined ? symbolsMap[id] : undefined;
}

export function useSymbolKeyFromAll(symbolKey?: string) {
  const { data: symbols = [] } = useSymbolsAll();
  const symbolsKeyMap = useSymbolsKeyMap(symbols);

  return symbolKey ? symbolsKeyMap[symbolKey.toUpperCase()] : undefined;
}
