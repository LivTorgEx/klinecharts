import { createContext, useContext } from "react";
export const ChartContext = createContext(null);
export function useChart() {
    return useContext(ChartContext);
}
