import {
  Settings,
  SettingsInputComposite,
  SvgIconComponent,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { Control, useForm } from "react-hook-form";

import {
  loadChartSettings,
  partialUpdateChartSettings,
} from "../../utils/chart";
import { KLineChartProjectionSettings } from "./KLineChartProjectionSettings";
import { KLineChartPositionSettings } from "./KLineChartPositionSettings";
import { ChartSettings } from "../../types/client/chart";

export type ChartSettingVariant = "projection" | "position";
export type Props<V extends ChartSettingVariant> = {
  variant: V;
  name: string;
  onClose(): void;
};

const Icons: Record<ChartSettingVariant, SvgIconComponent> = {
  projection: Settings,
  position: SettingsInputComposite,
};

export function KLineChartSettingsModal<V extends ChartSettingVariant>({
  variant,
  name,
  onClose,
}: Props<V>) {
  const form = useForm<ChartSettings[V]>();
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    const values: ChartSettings[V] = loadChartSettings(name)[variant];

    form.reset(values);
    setIsOpen(true);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = (values: any) => {
    partialUpdateChartSettings(name, { [variant]: values });
    handleClose();
  };
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  const Icon: SvgIconComponent = Icons[variant];

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <Icon fontSize="small" />
      </IconButton>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: form.handleSubmit(handleSave),
        }}
      >
        <DialogTitle>Settings for {variant}</DialogTitle>
        <DialogContent>
          {variant === "projection" && (
            <KLineChartProjectionSettings
              control={
                form.control as unknown as Control<ChartSettings["projection"]>
              }
            />
          )}
          {variant === "position" && (
            <KLineChartPositionSettings
              control={
                form.control as unknown as Control<ChartSettings["position"]>
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
