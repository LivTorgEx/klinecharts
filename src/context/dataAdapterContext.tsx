import { PropsWithChildren, createContext, useContext } from "react";

import {
  KLineChartDataAdapter,
  KLineChartSubscribeProjection,
  KLineChartSubscribeTrade,
} from "../types/client/dataAdapter";

const DataAdapterContext = createContext<KLineChartDataAdapter | null>(null);

type ProviderProps = PropsWithChildren<{
  adapter: KLineChartDataAdapter;
}>;

export function KLineChartDataAdapterProvider({
  adapter,
  children,
}: ProviderProps) {
  return (
    <DataAdapterContext.Provider value={adapter}>
      {children}
    </DataAdapterContext.Provider>
  );
}

export function useKLineChartDataAdapter(): KLineChartDataAdapter {
  const adapter = useContext(DataAdapterContext);

  if (!adapter) {
    throw new Error(
      "KLineChart data adapter is missing. Wrap chart components with KLineChartDataAdapterProvider."
    );
  }

  return adapter;
}

export function useSubscribeTrade(): KLineChartSubscribeTrade | undefined {
  return useKLineChartDataAdapter().subscribeTrade;
}

export function useSubscribeProjection():
  | KLineChartSubscribeProjection
  | undefined {
  return useKLineChartDataAdapter().subscribeProjection;
}
