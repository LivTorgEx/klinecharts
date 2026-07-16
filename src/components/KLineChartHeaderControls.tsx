import { Close, InfoOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { MouseEvent, ReactNode } from "react";
import { Chart } from "klinecharts";

import { TIMEFRAMES } from "../constants/app";
import { IndicatorSelector } from "./IndicatorSelector";
import { KLineChartSettingsModal } from "../settings/KLineChartSettingsModal";
import { KLineDataLoader } from "./KLineDataLoader";
import { KLineMobile } from "./KLineMobile";
import type { ChartSettingsProjectionItem } from "../types/client/chart";
import type { KLineChartProjectionIndicatorSnapshot } from "../types/client/dataAdapter";
import type { WebsocketProjectionEvent } from "../types/client/websocket";
import { getProjectionSummary } from "../projection/KLinePropjectionIndicators";

type Props = {
  chart: Chart | null;
  chartSettingName: string;
  timeframe: number;
  tokenSymbolKey?: string;
  enableRealTime: boolean;
  timeEndLoader?: number;
  headerActions?: ReactNode;
  children?: ReactNode;
  projectionTooltipItems: ChartSettingsProjectionItem[];
  projectionEvent?: WebsocketProjectionEvent;
  indicatorSnapshot?: KLineChartProjectionIndicatorSnapshot;
  projectionTooltipAnchorEl: HTMLButtonElement | null;
  onUpdateTimeframe: (timeframe: number) => void;
  onProjectionTooltipToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onProjectionTooltipClose: () => void;
  onRefreshSettings: () => void;
};

export function KLineChartHeaderControls({
  chart,
  chartSettingName,
  timeframe,
  tokenSymbolKey,
  enableRealTime,
  timeEndLoader,
  headerActions,
  children,
  projectionTooltipItems,
  projectionEvent,
  indicatorSnapshot,
  projectionTooltipAnchorEl,
  onUpdateTimeframe,
  onProjectionTooltipToggle,
  onProjectionTooltipClose,
  onRefreshSettings,
}: Props) {
  return (
    <Box>
      <KLineMobile />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ sx: 0, sm: 1 }}
        sx={{
          alignItems: { xs: "start", sm: "center" },
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            minWidth: 0,
          }}
        >
          <ToggleButtonGroup
            size="small"
            sx={{ height: 32, flexShrink: 0 }}
            color="primary"
            value={timeframe}
            exclusive
            onChange={(_, newTF) => onUpdateTimeframe(newTF)}
          >
            {TIMEFRAMES.map(({ label, value }) => (
              <ToggleButton
                key={value}
                value={value}
                sx={{ borderRadius: 0 }}
              >
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <IndicatorSelector chart={chart} name={chartSettingName} />
          <KLineChartSettingsModal
            name={chartSettingName}
            onClose={onRefreshSettings}
            variant="position"
          />
          <KLineChartSettingsModal
            name={chartSettingName}
            onClose={onRefreshSettings}
            variant="projection"
          />
          {headerActions}
          {tokenSymbolKey && (
            <KLineDataLoader
              timeframe={timeframe}
              symbolKey={tokenSymbolKey}
              timeEndLoader={timeEndLoader}
              symbol={tokenSymbolKey}
              enableRealTime={enableRealTime}
            />
          )}
        </Box>
        <Box sx={{ display: { xs: "none", sm: "block" }, flex: 1 }} />
        {projectionTooltipItems.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={onProjectionTooltipToggle}
              aria-label="Projection tooltip"
            >
              {projectionTooltipAnchorEl ? (
                <Close fontSize="inherit" />
              ) : (
                <InfoOutlined fontSize="inherit" />
              )}
            </IconButton>
            <Popover
              open={Boolean(projectionTooltipAnchorEl)}
              anchorEl={projectionTooltipAnchorEl}
              onClose={onProjectionTooltipClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              disableScrollLock
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.5,
                    minWidth: 240,
                    maxWidth: 420,
                    backgroundColor: "rgba(10, 12, 18, 0.92)",
                    backdropFilter: "blur(10px)",
                  },
                },
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  minWidth: 0,
                  backgroundColor: "transparent",
                  border: "none",
                }}
              >
                <Stack spacing={0.5} sx={{ px: 1, py: 1 }}>
                  {projectionTooltipItems.map((item) => {
                    const lines = getProjectionSummary(
                      item,
                      projectionEvent,
                      indicatorSnapshot
                    );
                    return (
                      <Typography
                        key={item.id}
                        variant="caption"
                        noWrap
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lines
                          .map((line) => `${line.label}: ${line.value}`)
                          .join(" | ")}
                      </Typography>
                    );
                  })}
                </Stack>
              </Paper>
            </Popover>
          </Box>
        )}
      </Stack>
      {children}
    </Box>
  );
}
