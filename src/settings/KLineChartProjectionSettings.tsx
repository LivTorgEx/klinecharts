import { Control, Controller, useFieldArray } from "react-hook-form";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Close } from "@mui/icons-material";
import { TradeSettingProIndicatorType } from "../types/strategyIndicatorType";

import { ChartSettingsProjection } from "../types/client/chart";
import { TRADING_INDICATOR_PROPERTIES } from "../constants/trading";
import { FieldSwitch } from "../components/form/FieldSwitch";

export type Props = {
  control: Control<ChartSettingsProjection>;
};

type BooleanKeysOnly = {
  [K in keyof ChartSettingsProjection as ChartSettingsProjection[K] extends boolean
    ? K
    : never]: boolean;
};
const OPTIONS: {
  name: keyof BooleanKeysOnly;
  label: string;
}[] = [
  { name: "showMessages", label: "Messages" },
  { name: "showLines", label: "Lines" },
  { name: "showMovements", label: "Movements" },
  { name: "showOrderBookLines", label: "Order Book lines" },
];

export function KLineChartProjectionSettings({ control }: Props) {
  const [indicatorName, setIndicatorName] =
    useState<TradeSettingProIndicatorType["type"]>();
  const { append, fields, remove } = useFieldArray({
    name: "indicators",
    control,
  });

  return (
    <Stack spacing={0}>
      {OPTIONS.map(({ name, label }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} {...field} />}
              label={`Show ${label}`}
            />
          )}
        />
      ))}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          mb: 2,
        }}
      >
        <Autocomplete
          size="small"
          sx={{ flexGrow: 1 }}
          disableClearable
          options={
            Object.keys(
              TRADING_INDICATOR_PROPERTIES
            ) as TradeSettingProIndicatorType["type"][]
          }
          renderInput={(params) => (
            <TextField {...params} margin="dense" label="Indicator Name" />
          )}
          onChange={(event, option) => {
            setIndicatorName(option);
          }}
        />
        <Button
          size="small"
          variant="contained"
          disabled={!indicatorName}
          onClick={() => {
            append({ name: indicatorName!, properties: {} });
          }}
        >
          Add
        </Button>
      </Stack>
      {fields.map((field, idx) => (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "start",
            mb: 2,
          }}
        >
          <Stack
            spacing={0}
            sx={{
              flexGrow: 1,
            }}
          >
            <Typography>{field.name}</Typography>
            <Stack
              direction="row"
              useFlexGap
              sx={{
                flexWrap: "wrap",
              }}
            >
              {TRADING_INDICATOR_PROPERTIES[
                field.name as TradeSettingProIndicatorType["type"]
              ]?.map((option) => {
                const name = typeof option === "string" ? option : option.value;
                const label =
                  typeof option === "string" ? option : option.label;
                return (
                  <Controller
                    control={control}
                    name={`indicators.${idx}.properties.${name}`}
                    render={(fieldProps) => (
                      <FieldSwitch label={label} {...fieldProps} />
                    )}
                  />
                );
              })}
            </Stack>
          </Stack>
          <IconButton
            color="error"
            onClick={() => {
              remove(idx);
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
}
