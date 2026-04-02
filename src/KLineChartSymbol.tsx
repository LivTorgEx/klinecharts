import { PropsWithChildren } from "react";
import { useSymbol } from "../hooks/api/symbolHooks";
import { KLineChart } from "./KLineChart";

type Props = PropsWithChildren<{ symbolId: number }>;

export function KLineChartSymbol({ symbolId, children }: Props) {
  const token = useSymbol(symbolId);

  return (
    <KLineChart token={token} chartSettingName="Symbol" height={600}>
      {children}
    </KLineChart>
  );
}
