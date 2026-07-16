import { Box, Paper, Stack, Typography } from "@mui/material";
import { useMemo } from "react";

import type { ChartSettingsProjectionItem } from "../types/client/chart";
import type { KLineChartProjectionIndicatorSnapshot } from "../types/client/dataAdapter";
import type { WebsocketProjectionEvent } from "../types/client/websocket";
import { formatBigNumber, toMeasurePrice } from "../utils/number";
type Props = {
  items: ChartSettingsProjectionItem[];
  projection?: WebsocketProjectionEvent;
  indicatorSnapshot?: KLineChartProjectionIndicatorSnapshot;
  showStaticLines?: boolean;
};

export type ProjectionValueLine = {
  label: string;
  value: string;
};

type ProjectionPlacementGroup = Record<"line1" | "line2" | "tooltip", ChartSettingsProjectionItem[]>;

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : "-";
  }
  return String(value);
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(2)}%`;
}

function formatProjectionCount(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return formatBigNumber(value);
}

function formatProjectionMoney(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return formatBigNumber(value);
}

export function getProjectionItemLabel(item: ChartSettingsProjectionItem): string {
  if (item.source.type === "projection") {
    return item.source.name;
  }

  const indicatorLabel = item.source.period
    ? `${item.source.name} ${item.source.period}`
    : item.source.name;
  return `${indicatorLabel} · ${item.source.property}`;
}

export function getProjectionSummary(
  item: ChartSettingsProjectionItem,
  projection?: WebsocketProjectionEvent,
  indicatorSnapshot?: KLineChartProjectionIndicatorSnapshot
): ProjectionValueLine[] {
  if (item.source.type === "projection") {
    const indicator = projection?.indicator;
    switch (item.source.name) {
      case "Status":
        return [
          {
            label: "Status",
            value: projection?.status ?? "Status",
          },
        ];
      case "NTPS": {
        const fastTrade = indicator?.ntps_fast_time
          ? `${(indicator.ntps_fast_time / 1000).toFixed(0)}secs`
          : "IDLE";
        return [
          {
            label: "NTPS",
            value: `${formatValue(indicator?.ntps)}|${fastTrade}`,
          },
        ];
      }
      case "TrandM":
        return [
          {
            label: "TrandM",
            value: formatPercent(indicator?.trandm),
          },
        ];
      case "Asset":
        return [
          {
            label: "Asset",
            value: formatProjectionCount(
              indicator?.asset_01 !== undefined ? indicator.asset_01 * 100 : undefined
            ),
          },
        ];
      case "Price":
        return [
          {
            label: "Price",
            value: [
              `1h: ${formatPercent(indicator?.price_1h)}`,
              `4h: ${formatPercent(indicator?.price_4h)}`,
              `8h: ${formatPercent(indicator?.price_8h)}`,
              `24h: ${formatPercent(indicator?.price_24h)}`,
            ].join(" | "),
          },
        ];
      case "OrderBook": {
        const orderBook = projection?.order_book;
        return [
          {
            label: "OrderBook",
            value: [
              `Buy ${formatValue(orderBook?.buy_amount)}`,
              `Sell ${formatValue(orderBook?.sell_amount)}`,
              orderBook?.buy_amount && orderBook?.sell_amount
                ? `B/S ${(orderBook.buy_amount / orderBook.sell_amount).toFixed(2)}`
                : undefined,
            ]
              .filter(Boolean)
              .join(" | "),
          },
        ];
      }
      case "OpenInterest": {
        const oi = projection?.oi;
        return [
          {
            label: "Open Interest",
            value: [
              `USD ${formatValue(oi?.usd)}`,
              `Change ${formatValue(oi?.change)}%`,
              `Qty ${formatValue(oi?.change_qty)}`,
            ].join(" | "),
          },
        ];
      }
      case "Candle":
        return [
          {
            label: "Candle",
            value: `Qty: ${formatProjectionCount(
              projection?.candle?.qtym_asset
            )}`,
          },
        ];
      default:
        return [];
    }
  }

  const snapshotValue =
    indicatorSnapshot?.indicators[item.source.key]?.[item.source.property];
  return [
    {
      label: `${item.source.name}[${item.source.key}]`,
      value: formatValue(snapshotValue),
    },
  ];
}

export function KLinePropjectionIndicators({
  items,
  projection,
  indicatorSnapshot,
  showStaticLines = true,
}: Props) {
  const groupedItems = useMemo<ProjectionPlacementGroup>(() => {
    return items.reduce<ProjectionPlacementGroup>(
      (acc, item) => {
        acc[item.placement].push(item);
        return acc;
      },
      { line1: [], line2: [], tooltip: [] }
    );
  }, [items]);

  if (
    groupedItems.line1.length === 0 &&
    groupedItems.line2.length === 0
  ) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {showStaticLines && (
        <Stack
          spacing={0.75}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            maxWidth: "68%",
            pointerEvents: "auto",
          }}
        >
          {(["line1", "line2"] as const).map((placement) => {
            const placementItems = groupedItems[placement];
            if (placementItems.length === 0) {
              return null;
            }

            return (
              <Box
                key={placement}
                sx={{
                  px: 1,
                  py: 0.5,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  {placementItems.map((item) => {
                    const lines = getProjectionSummary(
                      item,
                      projection,
                      indicatorSnapshot
                    );
                    return (
                      <Typography
                        key={item.id}
                        variant="caption"
                        noWrap
                        sx={{
                          minWidth: 0,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lines.map((line) => `${line.label}: ${line.value}`).join(
                          " | "
                        )}
                      </Typography>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
