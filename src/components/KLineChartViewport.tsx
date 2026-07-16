import { Box } from "@mui/material";
import { RefObject } from "react";

import { KLineProjectionHeaderLines } from "../projection/KLineProjectionHeaderLines";
import { KLinePropjectionIndicators } from "../projection/KLinePropjectionIndicators";
import type { ChartSettingsProjectionItem } from "../types/client/chart";
import type { KLineChartProjectionIndicatorSnapshot } from "../types/client/dataAdapter";
import type { WebsocketProjectionEvent } from "../types/client/websocket";

type Props = {
  chartRef: RefObject<HTMLDivElement | null>;
  chartHeight: number;
  tokenPresent: boolean;
  items: ChartSettingsProjectionItem[];
  projection?: WebsocketProjectionEvent;
  indicatorSnapshot?: KLineChartProjectionIndicatorSnapshot;
};

export function KLineChartViewport({
  chartRef,
  chartHeight,
  tokenPresent,
  items,
  projection,
  indicatorSnapshot,
}: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        height: chartHeight,
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {items.length > 0 && (
        <KLineProjectionHeaderLines
          items={items}
          projection={projection}
          indicatorSnapshot={indicatorSnapshot}
        />
      )}
      <Box
        ref={chartRef}
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
        }}
      />
      {tokenPresent && items.length > 0 && (
        <KLinePropjectionIndicators
          items={items}
          projection={projection}
          indicatorSnapshot={indicatorSnapshot}
          showStaticLines={false}
        />
      )}
    </Box>
  );
}
