import { Control, Controller } from "react-hook-form";
import { ChartSettingsPosition } from "../../types/client/chart";
import { Checkbox, FormControlLabel, Stack } from "@mui/material";

export type Props = {
  control: Control<ChartSettingsPosition>;
};

export function KLineChartPositionSettings({ control }: Props) {
  return (
    <Stack spacing={0}>
      <Controller
        name="showFinished"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox checked={field.value} {...field} />}
            label="Show finished positions"
          />
        )}
      />
    </Stack>
  );
}
