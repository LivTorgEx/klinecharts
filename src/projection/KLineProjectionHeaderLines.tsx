import { Box, Typography } from "@mui/material";

import type { ChartSettingsProjectionItem } from "../types/client/chart";
import type { KLineChartProjectionIndicatorSnapshot } from "../types/client/dataAdapter";
import type { WebsocketProjectionEvent } from "../types/client/websocket";
import { getProjectionSummary } from "./KLinePropjectionIndicators";

type Props = {
  items: ChartSettingsProjectionItem[];
  projection?: WebsocketProjectionEvent;
  indicatorSnapshot?: KLineChartProjectionIndicatorSnapshot;
};

function formatSummary(
  item: ChartSettingsProjectionItem,
  projection?: WebsocketProjectionEvent,
  indicatorSnapshot?: KLineChartProjectionIndicatorSnapshot
) {
  return getProjectionSummary(item, projection, indicatorSnapshot)
    .map((line) => `${line.label}: ${line.value}`)
    .join(" | ");
}

export function KLineProjectionHeaderLines({
  items,
  projection,
  indicatorSnapshot,
}: Props) {
  const line1 = items.filter((item) => item.placement === "line1");
  const line2 = items.filter((item) => item.placement === "line2");

  if (line1.length === 0 && line2.length === 0) {
    return null;
  }

  const renderLine = (
    placement: "line1" | "line2",
    placementItems: ChartSettingsProjectionItem[]
  ) => {
    if (placementItems.length === 0) {
      return null;
    }

    return (
      <Box
        key={placement}
        sx={{
          px: 1,
          py: 0.25,
          overflow: "hidden",
          borderTop:
            placement === "line2" ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <Typography
          variant="caption"
          noWrap
          sx={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {placementItems
            .map((item) => formatSummary(item, projection, indicatorSnapshot))
            .join("  |  ")}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%" }}>
        {renderLine("line1", line1)}
        {renderLine("line2", line2)}
      </Box>
    </Box>
  );
}
