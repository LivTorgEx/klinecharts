import { registerIndicator } from "klinecharts";

import type { MarketDecision } from "../types/client/marketDecision";

export const MARKET_DECISION_STATUS_INDICATOR_ID = "market-decision-status";
export const MARKET_DECISION_STATUS_INDICATOR_NAME = "MARKET_DECISION_STATUS";

registerIndicator<unknown, unknown, MarketDecision | null>({
  name: MARKET_DECISION_STATUS_INDICATOR_NAME,
  shortName: "",
  figures: [],
  calc: () => [],
  createTooltipDataSource: ({ indicator }) => {
    const decision = indicator.extendData as MarketDecision | null;

    return {
      name: "",
      calcParamsText: "",
      features: [],
      legends: decision
        ? [{ title: "NTP 5s: ", value: String(decision.ntp_5s) }]
        : [],
    };
  },
});
