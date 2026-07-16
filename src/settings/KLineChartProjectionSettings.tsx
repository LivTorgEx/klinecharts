import { Add, ArrowLeft, ArrowRight, Close } from "@mui/icons-material";
import {
  Button,
  Collapse,
  Box,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Control, Controller, useFieldArray } from "react-hook-form";

import { useChartSettings } from "../context/chartSettings";
import {
  useKLineChartDataAdapter,
  useSubscribeProjection,
} from "../context/dataAdapterContext";
import { useSymbolKey } from "../context/symbolKey";
import { useTradeIndicator } from "../hooks/api/tradeIndicator";
import {
  getProjectionSummary,
} from "../projection/KLinePropjectionIndicators";
import type {
  ChartSettingsProjection,
  ChartSettingsProjectionItem,
  ChartSettingsProjectionPlacement,
  ChartSettingsProjectionSourceProjectionType,
} from "../types/client/chart";
import type { KLineChartProjectionIndicatorCatalogItem } from "../types/client/dataAdapter";
import type { WebsocketProjectionEvent } from "../types/client/websocket";

export type Props = {
  control: Control<ChartSettingsProjection>;
};

const PROJECTION_OPTIONS: ChartSettingsProjectionSourceProjectionType[] = [
  "Status",
  "NTPS",
  "TrandM",
  "Asset",
  "Price",
  "OrderBook",
  "OpenInterest",
  "Candle",
];

const PLACEMENT_OPTIONS: {
  value: ChartSettingsProjectionPlacement;
  label: string;
}[] = [
  { value: "line1", label: "Static line 1" },
  { value: "line2", label: "Static line 2" },
  { value: "tooltip", label: "Tooltip" },
];

const STATIC_PLACEMENTS: Array<Exclude<ChartSettingsProjectionPlacement, "tooltip">> = [
  "line1",
  "line2",
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getPlacementLabel(placement: ChartSettingsProjectionPlacement) {
  switch (placement) {
    case "line1":
      return "Static line 1";
    case "line2":
      return "Static line 2";
    case "tooltip":
      return "Tooltip";
  }
}

function getIndicatorLabel(item: KLineChartProjectionIndicatorCatalogItem) {
  return item.period ? `${item.name} ${item.period}` : item.name;
}

function groupItems(
  items: ChartSettingsProjectionItem[]
): Record<ChartSettingsProjectionPlacement, ChartSettingsProjectionItem[]> {
  return items.reduce<Record<ChartSettingsProjectionPlacement, ChartSettingsProjectionItem[]>>(
    (acc, item) => {
      acc[item.placement].push(item);
      return acc;
    },
    { line1: [], line2: [], tooltip: [] }
  );
}

function findNeighborIndex(
  items: ChartSettingsProjectionItem[],
  itemId: string,
  placement: ChartSettingsProjectionPlacement,
  direction: -1 | 1
): number {
  const currentIndex = items.findIndex((item) => item.id === itemId);
  if (currentIndex < 0) {
    return -1;
  }

  for (
    let index = currentIndex + direction;
    index >= 0 && index < items.length;
    index += direction
  ) {
    if (items[index].placement === placement) {
      return index;
    }
  }

  return -1;
}

export function KLineChartProjectionSettings({ control }: Props) {
  const adapter = useKLineChartDataAdapter();
  const { timeframe } = useChartSettings();
  const symbolKey = useSymbolKey();
  const subscribeProjection = useSubscribeProjection();
  const [sourceKind, setSourceKind] = useState<"projection" | "indicator">(
    "projection"
  );
  const [projectionName, setProjectionName] =
    useState<ChartSettingsProjectionSourceProjectionType>("Status");
  const [placement, setPlacement] =
    useState<ChartSettingsProjectionPlacement>("tooltip");
  const [indicatorKey, setIndicatorKey] = useState("");
  const [indicatorProperty, setIndicatorProperty] = useState("");
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(true);
  const [previewProjectionEvent, setPreviewProjectionEvent] = useState<
    WebsocketProjectionEvent | undefined
  >(undefined);

  const { append, fields, move, remove } = useFieldArray({
    name: "items",
    control,
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["ProjectionIndicatorCatalog"],
    queryFn: async () => {
      if (!adapter.loadProjectionIndicatorCatalog) {
        return [];
      }
      return adapter.loadProjectionIndicatorCatalog();
    },
    enabled: Boolean(adapter.loadProjectionIndicatorCatalog),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: (query) =>
      query.state.data && query.state.data.length > 0 ? false : 3_000,
  });

  const selectedIndicator = useMemo(
    () => catalog.find((item) => item.key === indicatorKey),
    [catalog, indicatorKey]
  );

  useEffect(() => {
    if (!selectedIndicator) {
      if (catalog.length > 0 && !indicatorKey) {
        setIndicatorKey(catalog[0].key);
      }
      return;
    }

    if (!indicatorProperty) {
      setIndicatorProperty(selectedIndicator.properties?.[0] ?? "Value");
    }
  }, [catalog, indicatorKey, indicatorProperty, selectedIndicator]);

  useEffect(() => {
    if (activePreviewId && !fields.some((field) => field.id === activePreviewId)) {
      setActivePreviewId(null);
    }
  }, [activePreviewId, fields]);

  useEffect(() => {
    if (!symbolKey || !subscribeProjection) {
      return;
    }

    const unsubscribe = subscribeProjection(symbolKey, setPreviewProjectionEvent);
    return () => {
      unsubscribe();
    };
  }, [subscribeProjection, symbolKey]);

  const { data: previewIndicatorSnapshot } = useTradeIndicator({
    timeframe,
    symbolKey,
  });
  const hasPreviewSnapshot = Boolean(previewIndicatorSnapshot);

  const canAddIndicator =
    sourceKind === "indicator" && Boolean(selectedIndicator) && Boolean(indicatorProperty);

  const previewItems = useMemo(
    () => fields as unknown as ChartSettingsProjectionItem[],
    [fields]
  );
  const groupedPreviewItems = useMemo(() => groupItems(previewItems), [previewItems]);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Add item</Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{ flexWrap: "wrap" }}
          >
            <TextField
              select
              size="small"
              label="Source"
              value={sourceKind}
              onChange={(event) =>
                setSourceKind(event.target.value as "projection" | "indicator")
              }
              sx={{ width: { xs: "100%", sm: 130 } }}
            >
              <MenuItem value="projection">Projection</MenuItem>
              <MenuItem value="indicator">Indicator</MenuItem>
            </TextField>

            {sourceKind === "projection" ? (
              <TextField
                select
                size="small"
                label="Projection"
                value={projectionName}
                onChange={(event) =>
                  setProjectionName(
                    event.target.value as ChartSettingsProjectionSourceProjectionType
                  )
                }
                sx={{ width: { xs: "100%", sm: 150 } }}
              >
                {PROJECTION_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <>
                <TextField
                  select
                  size="small"
                  label="Indicator"
                  value={indicatorKey}
                  onChange={(event) => {
                    setIndicatorKey(event.target.value);
                    const found = catalog.find(
                      (item) => item.key === event.target.value
                    );
                    setIndicatorProperty(found?.properties?.[0] ?? "Value");
                  }}
                  sx={{ width: { xs: "100%", sm: 180, md: 160 } }}
                  disabled={catalog.length === 0}
                >
                  {catalog.map((item) => (
                    <MenuItem key={item.key} value={item.key}>
                      {getIndicatorLabel(item)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Property"
                  value={indicatorProperty}
                  onChange={(event) => setIndicatorProperty(event.target.value)}
                  sx={{ width: { xs: "100%", sm: 150 } }}
                  disabled={!selectedIndicator}
                >
                  {(selectedIndicator?.properties ?? []).map((property) => (
                    <MenuItem key={property} value={property}>
                      {property}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            <TextField
              select
              size="small"
              label="Placement"
              value={placement}
              onChange={(event) =>
                setPlacement(event.target.value as ChartSettingsProjectionPlacement)
              }
              sx={{ width: { xs: "100%", sm: 150 } }}
            >
              {PLACEMENT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              sx={{ alignSelf: { xs: "stretch", md: "center" } }}
              disabled={sourceKind === "indicator" ? !canAddIndicator : false}
              onClick={() => {
                if (sourceKind === "projection") {
                  append({
                    id: makeId("projection"),
                    placement,
                    source: {
                      type: "projection",
                      name: projectionName,
                    },
                  });
                  return;
                }

                if (!selectedIndicator || !indicatorProperty) {
                  return;
                }

                append({
                  id: makeId("indicator"),
                  placement,
                  source: {
                    type: "indicator",
                    name: selectedIndicator.name,
                    key: selectedIndicator.key,
                    property: indicatorProperty,
                    period: selectedIndicator.period,
                  },
                });
              }}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={1}>
        <Typography variant="subtitle2">Preview</Typography>
        <Box
          sx={{
            position: "relative",
            minHeight: 320,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack
            spacing={0.75}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              maxWidth: "72%",
              pointerEvents: "auto",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                px: 1,
                py: 0.5,
                width: "fit-content",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption">
                {hasPreviewSnapshot
                  ? "Selected time: latest loaded snapshot"
                  : "No preview snapshot loaded yet"}
              </Typography>
            </Box>

            {STATIC_PLACEMENTS.map((linePlacement) => {
              const placementItems = groupedPreviewItems[linePlacement];

              return (
                <Box
                  key={linePlacement}
                  sx={{
                    px: 1,
                    py: 0.75,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {getPlacementLabel(linePlacement)}
                    </Typography>
                    {placementItems.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No items configured.
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ flexWrap: "wrap", alignItems: "flex-start" }}
                      >
                        {placementItems.map((item) => {
                          const globalIndex = previewItems.findIndex(
                            (field) => field.id === item.id
                          );
                          const isActive = activePreviewId === item.id;
                          const lines = getProjectionSummary(
                            item,
                            previewProjectionEvent,
                            previewIndicatorSnapshot
                          );
                          const moveLeftIndex = findNeighborIndex(
                            previewItems,
                            item.id,
                            linePlacement,
                            -1
                          );
                          const moveRightIndex = findNeighborIndex(
                            previewItems,
                            item.id,
                            linePlacement,
                            1
                          );

                          return (
                            <Box
                              key={item.id}
                              onClick={() =>
                                setActivePreviewId((current) =>
                                  current === item.id ? null : item.id
                                )
                              }
                              sx={{
                                px: 1,
                                py: 0.5,
                                cursor: "pointer",
                                border: 1,
                                borderColor: isActive ? "primary.main" : "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                component="span"
                                variant="caption"
                                noWrap
                                sx={{ display: "block" }}
                              >
                                {lines
                                  .map((line) => `${line.label}: ${line.value}`)
                                  .join(" | ")}
                              </Typography>

                              <Collapse in={isActive}>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{ pt: 0.75, justifyContent: "flex-end" }}
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <IconButton
                                    size="small"
                                    disabled={moveLeftIndex < 0}
                                    onClick={() => move(globalIndex, moveLeftIndex)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1.5,
                                    }}
                                  >
                                    <ArrowLeft fontSize="inherit" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    disabled={moveRightIndex < 0}
                                    onClick={() => move(globalIndex, moveRightIndex)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1.5,
                                    }}
                                  >
                                    <ArrowRight fontSize="inherit" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => remove(globalIndex)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "error.main",
                                      borderRadius: 1.5,
                                    }}
                                  >
                                    <Close fontSize="inherit" />
                                  </IconButton>
                                </Stack>
                              </Collapse>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              pointerEvents: "auto",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                minWidth: 240,
                maxWidth: 420,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  px: 1,
                  py: 0.5,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Projection
                </Typography>
                <IconButton size="small" onClick={() => setTooltipOpen((value) => !value)}>
                  {tooltipOpen ? (
                    <Close fontSize="inherit" />
                  ) : (
                    <Typography variant="caption">i</Typography>
                  )}
                </IconButton>
              </Stack>
              <Collapse in={tooltipOpen}>
                <Stack spacing={0.5} sx={{ px: 1, pb: 1 }}>
                  {groupedPreviewItems.tooltip.length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No tooltip items configured.
                    </Typography>
                  )}
                  {groupedPreviewItems.tooltip.map((item) => {
                    const globalIndex = previewItems.findIndex(
                      (field) => field.id === item.id
                    );
                    const isActive = activePreviewId === item.id;
                    const lines = getProjectionSummary(
                      item,
                      previewProjectionEvent,
                      previewIndicatorSnapshot
                    );
                    const moveLeftIndex = findNeighborIndex(
                      previewItems,
                      item.id,
                      "tooltip",
                      -1
                    );
                    const moveRightIndex = findNeighborIndex(
                      previewItems,
                      item.id,
                      "tooltip",
                      1
                    );

                    return (
                      <Box
                        key={item.id}
                        onClick={() =>
                          setActivePreviewId((current) =>
                            current === item.id ? null : item.id
                          )
                        }
                        sx={{
                          px: 1,
                          py: 0.5,
                          cursor: "pointer",
                          border: 1,
                          borderColor: isActive ? "primary.main" : "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          component="span"
                          variant="caption"
                          noWrap
                          sx={{ display: "block" }}
                        >
                          {lines
                            .map((line) => `${line.label}: ${line.value}`)
                            .join(" | ")}
                        </Typography>

                        <Collapse in={isActive}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ pt: 0.75, justifyContent: "flex-end" }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <IconButton
                              size="small"
                              disabled={moveLeftIndex < 0}
                              onClick={() => move(globalIndex, moveLeftIndex)}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1.5,
                              }}
                            >
                              <ArrowLeft fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={moveRightIndex < 0}
                              onClick={() => move(globalIndex, moveRightIndex)}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1.5,
                              }}
                            >
                              <ArrowRight fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => remove(globalIndex)}
                              sx={{
                                border: "1px solid",
                                borderColor: "error.main",
                                borderRadius: 1.5,
                              }}
                            >
                              <Close fontSize="inherit" />
                            </IconButton>
                          </Stack>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </Collapse>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}
