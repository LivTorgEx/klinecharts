import { useEffect } from "react";
import type { Chart } from "klinecharts";

import { useMarketDecision } from "../context/marketDecision";
import {
  MARKET_DECISION_STATUS_INDICATOR_ID,
  MARKET_DECISION_STATUS_INDICATOR_NAME,
} from "../indicators/marketDecisionStatus";

type Props = {
  chart: Chart | null;
};

export function KLineChartMarketDecisionIndicator({ chart }: Props) {
  const decision = useMarketDecision();

  useEffect(() => {
    if (!chart) return;

    chart.overrideIndicator({
      id: MARKET_DECISION_STATUS_INDICATOR_ID,
      name: MARKET_DECISION_STATUS_INDICATOR_NAME,
      extendData: decision,
    });
  }, [chart, decision]);

  return null;
}
