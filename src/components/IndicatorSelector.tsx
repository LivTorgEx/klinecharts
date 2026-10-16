import { useState } from "react";
import type { Chart, IndicatorCreate } from "klinecharts";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@livtorgex/ui-kit";

import { createTooltipDataSource } from "../constants/style";
import type { ChartSettingsIndicator } from "../types/client/chart";
import { loadChartSettings, partialUpdateChartSettings } from "../utils/chart";

type Props = {
  name: string;
  chart: Chart | null;
};

type IndicatorOption = {
  name: string;
  calcParams?: number[];
  label: string;
  overlay: boolean;
};

const INDICATORS: IndicatorOption[] = [
  { name: "pSAR", label: "Parabolic SAR", overlay: true },
  {
    name: "ATRTralling",
    calcParams: [1, 10],
    label: "ATR Tralling",
    overlay: true,
  },
  {
    name: "SuperTrend",
    calcParams: [10, 3],
    label: "SuperTrend",
    overlay: true,
  },
  {
    name: "LTE_SMA",
    calcParams: [25],
    label: "Simple Moving Average (SMA)",
    overlay: true,
  },
  { name: "EMA", calcParams: [25], label: "EMA", overlay: true },
  { name: "RMA", calcParams: [14], label: "RMA", overlay: true },
  {
    name: "BOLL",
    calcParams: [20, 2],
    label: "Bollinger Bands",
    overlay: true,
  },
  {
    name: "LSMA",
    calcParams: [50],
    label: "Least Squares Moving Average",
    overlay: true,
  },
  { name: "CE", calcParams: [22, 3], label: "Chandelier Exit", overlay: true },
  { name: "ZigZag", calcParams: [1.5, 9], label: "ZigZag", overlay: true },
  {
    name: "ZigZagLine",
    calcParams: [1.5, 9],
    label: "ZigZagLine",
    overlay: true,
  },
  {
    name: "MRC",
    calcParams: [200, 1, 1.77, 2.415, 3.04],
    label: "Mean Reversion Channel (MRC)",
    overlay: true,
  },
  {
    name: "DirectionalPivotSignal",
    calcParams: [30, 5, 5],
    label: "Directional Pivot Signal",
    overlay: true,
  },
  { name: "EMACross", calcParams: [9, 26], label: "EMA Cross", overlay: true },
  { name: "Imbalance", label: "Imbalance", overlay: true },
  { name: "movement", label: "Movement", overlay: true },
  { name: "movementCascade", label: "Movement (Cascade)", overlay: true },
  { name: "VOL", label: "Volume", overlay: false },
  {
    name: "VOL_GD",
    calcParams: [50],
    label: "Volume (Gain/Drop)",
    overlay: false,
  },
  {
    name: "VOL_BUY_SELL",
    calcParams: [50],
    label: "Volume (Buy/Sell)",
    overlay: false,
  },
  { name: "SMI", label: "SMI", overlay: false },
  { name: "ATR", label: "ATR", overlay: false },
  { name: "LTE_RSI", calcParams: [14], label: "RSI", overlay: false },
  { name: "NATR", calcParams: [14], label: "nATR", overlay: false },
  {
    name: "MFI",
    calcParams: [14],
    label: "Money Flow Index (MFI)",
    overlay: false,
  },
  {
    name: "CCI",
    calcParams: [20],
    label: "Commodity Channel Index (CCI)",
    overlay: false,
  },
  {
    name: "Stochastic",
    calcParams: [14, 1, 3],
    label: "Stochastic",
    overlay: false,
  },
  {
    name: "MACD",
    calcParams: [12, 26, 9],
    label: "Moving Average Convergence Divergence (MACD)",
    overlay: false,
  },
];

function notifySettingsUpdated(name: string) {
  window.dispatchEvent(
    new CustomEvent("klinechart:settings-updated", { detail: { name } })
  );
}

function createIndicatorId(
  indicator: IndicatorCreate,
  existing: ChartSettingsIndicator[]
) {
  const base = `${indicator.name}${indicator.calcParams?.length ? `_${indicator.calcParams.join("_")}` : ""}`;
  let id = base;
  let instance = 2;
  while (existing.some((item) => item.id === id)) {
    id = `${base}_${instance}`;
    instance += 1;
  }
  return id;
}

export function IndicatorSelector({ name, chart }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const options = INDICATORS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );
  const overlayOptions = options.filter((item) => item.overlay);
  const subpaneOptions = options.filter((item) => !item.overlay);

  function addIndicator(option: IndicatorOption) {
    if (!chart) return;
    const indicator: IndicatorCreate = {
      name: option.name,
      ...(option.calcParams ? { calcParams: [...option.calcParams] } : {}),
    };
    const current = loadChartSettings(name).indicators;
    const id = createIndicatorId(indicator, current);
    const params: Omit<ChartSettingsIndicator, "id"> = {
      indicator,
      isStack: true,
      ...(option.overlay ? { paneOptions: { id: "candle_pane" } } : {}),
    };
    const createdId = chart.createIndicator(
      {
        ...indicator,
        id,
        ...(params.paneOptions?.id
          ? { paneId: params.paneOptions.id }
          : {}),
        createTooltipDataSource,
      },
      params.isStack
    );
    if (!createdId) return;

    const resolvedCalcParams = chart
      .getIndicators({ id })[0]
      ?.calcParams.filter(
        (value): value is number => typeof value === "number"
      );
    if (resolvedCalcParams?.length) {
      params.indicator = { ...indicator, calcParams: resolvedCalcParams };
    }

    partialUpdateChartSettings(name, (previous) => ({
      indicators: [...previous.indicators, { ...params, id }],
    }));
    notifySettingsUpdated(name);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="icon-ghost"
          type="button"
          className="rounded-none text-gray-300"
          disabled={!chart}
          aria-label="Add indicator"
          title="Add indicator"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 20 20"
            className="h-[18px] w-[18px]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          >
            <path d="M9.4 3.5H8.2c-1.3 0-2 .9-2.2 2.3L5 15.8M3.8 7.4h5" />
            <path d="m10.3 8.7 5.1 5.1m0-5.1-5.1 5.1" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(92vw,380px)] rounded-none border-gray-700 bg-[#0b0c0e] p-2"
      >
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search indicators"
          />
          <CommandList>
            <CommandEmpty>No matching indicators.</CommandEmpty>
            {overlayOptions.length > 0 && (
              <CommandGroup heading="Overlay indicators">
                {overlayOptions.map((item) => (
                  <CommandItem
                    key={item.name}
                    onSelect={() => addIndicator(item)}
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {subpaneOptions.length > 0 && (
              <CommandGroup heading="Subpane indicators">
                {subpaneOptions.map((item) => (
                  <CommandItem
                    key={item.name}
                    onSelect={() => addIndicator(item)}
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
