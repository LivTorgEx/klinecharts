import { useState } from "react";
import type { Chart } from "klinecharts";
import { Button, Dialog, Input, Text } from "@livtorgex/ui-kit";

import { createTooltipDataSource } from "../constants/style";
import { useChartSettings } from "../context/chartSettings";
import { partialUpdateChartSettings } from "../utils/chart";

type Props = {
  name: string;
  chart: Chart | null;
  indicatorId: string | null;
  onClose: () => void;
};

function emitSettingsUpdated(name: string) {
  window.dispatchEvent(
    new CustomEvent("klinechart:settings-updated", { detail: { name } })
  );
}

export function IndicatorEditDialog({
  name,
  chart,
  indicatorId,
  onClose,
}: Props) {
  const settings = useChartSettings();
  const item = settings.indicators.find(({ id }) => id === indicatorId);
  const chartIndicator = indicatorId
    ? chart?.getIndicators({ id: indicatorId })[0]
    : undefined;
  const savedParams = item?.indicator.calcParams ?? [];
  const chartParams =
    chartIndicator?.calcParams.filter(
      (value): value is number => typeof value === "number"
    ) ?? [];
  const params = savedParams.length > 0 ? savedParams : chartParams;
  const [values, setValues] = useState(() => params.map(String));
  const parsedValues = values.map(Number);
  const canSave =
    Boolean(item && chart && params.length > 0) &&
    parsedValues.length === params.length &&
    parsedValues.every((value) => Number.isFinite(value) && value > 0);

  function save() {
    if (!item || !chart || !chartIndicator || !canSave) return;

    chart.overrideIndicator({
      id: item.id,
      name: item.indicator.name,
      calcParams: parsedValues,
      createTooltipDataSource,
    });
    partialUpdateChartSettings(name, (previous) => ({
      indicators: previous.indicators.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              indicator: {
                ...entry.indicator,
                calcParams: parsedValues,
              },
            }
          : entry
      ),
    }));
    emitSettingsUpdated(name);
    onClose();
  }

  return (
    <Dialog
      open={indicatorId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item ? `Edit ${item.indicator.name}` : "Edit indicator"}
      description="These settings apply to this indicator instance."
      className="w-[min(92vw,460px)]"
    >
      {item && params.length > 0 ? (
        <div className="space-y-3">
          {params.map((value, index) => (
            <label
              key={`${item.id}-${index}`}
              className="grid grid-cols-[1fr_8rem] items-center gap-3"
            >
              <Text variant="caption" tone="muted">
                Parameter {index + 1}
              </Text>
              <Input
                aria-label={`${item.indicator.name} parameter ${index + 1}`}
                type="number"
                min="0.000001"
                step="any"
                value={values[index] ?? String(value)}
                onChange={(event) =>
                  setValues((current) => {
                    const next = [...current];
                    next[index] = event.currentTarget.value;
                    return next;
                  })
                }
                className="h-9 rounded-none border-[#292c30] !bg-[#0b0d0f] px-2 py-1 font-mono text-xs"
              />
            </label>
          ))}
        </div>
      ) : (
        <Text variant="caption" tone="muted">
          This indicator has no editable parameters.
        </Text>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {params.length > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={!canSave}
            onClick={save}
          >
            Save
          </Button>
        ) : null}
      </div>
    </Dialog>
  );
}
