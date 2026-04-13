import { createContext, useContext } from "react";
import { Nullable, Chart } from "klinecharts";

export const ChartContext = createContext<Nullable<Chart>>(null);
export function useChart() {
  return useContext(ChartContext);
}
