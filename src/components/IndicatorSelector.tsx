import { useState } from "react";
import { Chart, IndicatorCreate, Nullable } from "klinecharts";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { useToggle } from "usehooks-ts";

import { createTooltipDataSource } from "../constants/style";
import { ChartSettingsIndicator } from "../../types/client/chart";
import { partialUpdateChartSettings } from "../../utils/chart";
import { SearchField } from "../../components/elements/SearchField";

type Props = {
  name: string;
  chart: Nullable<Chart>;
};
type IndicatorOption = {
  name: string;
  calcParams?: number[];
  label: string;
};

const INDICATORS: IndicatorOption[] = [
  { name: "pSAR", label: "Parabolic SAR" },
  { name: "ATRTralling", calcParams: [1, 10], label: "ATR Tralling" },
  { name: "SuperTrend", calcParams: [10, 3], label: "SuperTrend" },
  { name: "LTE_SMA", calcParams: [25], label: "Simple Moving Average (SMA)" },
  { name: "EMA", calcParams: [25], label: "EMA" },
  { name: "RMA", calcParams: [14], label: "RMA" },
  { name: "BOLL", calcParams: [20, 2], label: "Bollinger Bands" },
  { name: "LSMA", calcParams: [50], label: "Least Squares Moving Average" },
  { name: "CE", calcParams: [22, 3], label: "Chandelier Exit" },
  { name: "ZigZag", calcParams: [1.5, 9], label: "ZigZag" },
  { name: "ZigZagLine", calcParams: [1.5, 9], label: "ZigZagLine" },
  {
    name: "MRC",
    calcParams: [200, 1, 1.77, 2.415, 3.04],
    label: "Mean Reversion Channel (MRC)",
  },
  {
    name: "DirectionalPivotSignal",
    calcParams: [30, 5, 5],
    label: "Directional Pivot Signal",
  },
  { name: "EMACross", label: "EMA Cross", calcParams: [9, 26] },
  { name: "Imbalance", label: "Imbalance" },
];
const SUB_INDICATORS: IndicatorOption[] = [
  { name: "VOL", label: "Volume" },
  { name: "VOL_GD", label: "Volume (Gain/Drop)", calcParams: [50] },
  { name: "VOL_BUY_SELL", label: "Volume (Buy/Sell)", calcParams: [50] },
  { name: "SMI", label: "SMI" },
  { name: "ATR", label: "ATR" },
  { name: "LTE_RSI", label: "RSI", calcParams: [14] },
  { name: "NATR", calcParams: [14], label: "nATR" },
  { name: "MFI", calcParams: [14], label: "Money Flow Index (MFI)" },
  { name: "CCI", calcParams: [20], label: "Commodity Channel Index (CCI)" },
  { name: "Stochastic", calcParams: [14, 1, 3], label: "Stochastic" },
  {
    name: "MACD",
    calcParams: [12, 26, 9],
    label: "Moving Average Convergence Divergence (MACD)",
  },
];

export function IndicatorSelector({ chart, name }: Props) {
  const [isOpen, toggleIsOpen] = useToggle(false);
  const [search, setSearch] = useState("");

  const handleClose = () => {
    setSearch("");
    toggleIsOpen();
  };
  const handleCreateIndicator = (
    params: Omit<ChartSettingsIndicator, "id">
  ) => {
    if (!chart) {
      return;
    }

    const indicatorId =
      params.indicator.name +
      (params.indicator.calcParams
        ? params.indicator.calcParams.join("_")
        : "");

    partialUpdateChartSettings(name, ({ indicators }) => {
      if (indicators.find(({ id }) => id === indicatorId)) {
        return false;
      }
      chart.createIndicator(
        {
          ...params.indicator,
          id: indicatorId,
          createTooltipDataSource,
        },
        params.isStack,
        params.paneOptions
      );

      return {
        indicators: [...indicators, { ...params, id: indicatorId }],
      };
    });
  };
  const handleAddIndicator = (indicator: IndicatorCreate) => {
    const params: Omit<ChartSettingsIndicator, "id"> = {
      indicator,
      isStack: true,
      paneOptions: { id: "candle_pane" },
    };
    handleCreateIndicator(params);
    handleClose();
  };
  const handleAddSubIndicator = (indicator: IndicatorCreate) => {
    const params: Omit<ChartSettingsIndicator, "id"> = {
      indicator,
      isStack: true,
    };
    handleCreateIndicator(params);
    handleClose();
  };

  return (
    <>
      <IconButton size="small" onClick={toggleIsOpen}>
        <InfoOutlined />
      </IconButton>
      <Dialog open={isOpen} onClose={toggleIsOpen} maxWidth="md" fullWidth>
        <DialogTitle>Indicators</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <SearchField
              fullWidth
              defaultValue={search}
              onChange={setSearch}
              delay={16}
            />
          </Box>
          {INDICATORS.filter(({ label }) =>
            label.toLowerCase().includes(search.toLowerCase())
          ).map(({ label, ...params }) => (
            <MenuItem
              key={params.name}
              onClick={() => {
                handleAddIndicator(params);
              }}
            >
              {label}
            </MenuItem>
          ))}

          <Divider />
          {SUB_INDICATORS.filter(({ label }) =>
            label.toLowerCase().includes(search.toLowerCase())
          ).map(({ label, ...params }) => (
            <MenuItem
              key={params.name}
              onClick={() => {
                handleAddSubIndicator(params);
              }}
            >
              {label}
            </MenuItem>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
