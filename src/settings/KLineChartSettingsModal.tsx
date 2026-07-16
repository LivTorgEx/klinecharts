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
  Stack,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { Control, useForm } from "react-hook-form";
import { ContentCopy, ContentPaste } from "@mui/icons-material";

import { loadChartSettings, partialUpdateChartSettings } from "../utils/chart";
import { copyText, pasteJsonText } from "../utils/copypaste";
import { KLineChartProjectionSettings } from "./KLineChartProjectionSettings";
import { KLineChartPositionSettings } from "./KLineChartPositionSettings";
import { ChartSettings } from "../types/client/chart";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isProjectionSettings(
  value: unknown
): value is ChartSettings["projection"] {
  return isRecord(value) && Array.isArray(value.items);
}

function isPositionSettings(
  value: unknown
): value is ChartSettings["position"] {
  return isRecord(value) && typeof value.showFinished === "boolean";
}

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
  const handleCopy = async () => {
    try {
      await copyText(
        JSON.stringify(
          {
            variant,
            settings: form.getValues(),
          },
          null,
          2
        )
      );
    } catch {
      // Ignore canceled copy flows.
    }
  };
  const handlePaste = async () => {
    try {
      const data = await pasteJsonText();
      if (!isRecord(data)) {
        return;
      }

      const wrapperValue =
        data.variant === variant && isRecord(data.settings)
          ? data.settings
          : undefined;
      const directValue = variant in data ? data[variant] : undefined;
      const nextValues =
        (variant === "projection" && isProjectionSettings(wrapperValue)
          ? wrapperValue
          : variant === "position" && isPositionSettings(wrapperValue)
            ? wrapperValue
            : undefined) ??
        (variant === "projection" && isProjectionSettings(directValue)
          ? directValue
          : variant === "position" && isPositionSettings(directValue)
            ? directValue
            : undefined) ??
        (variant === "projection" && isProjectionSettings(data)
          ? data
          : variant === "position" && isPositionSettings(data)
            ? data
            : undefined);

      if (nextValues) {
        form.reset(nextValues as ChartSettings[V]);
      }
    } catch {
      // Keep the dialog open when paste fails or is canceled.
    }
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
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              width: "min(1180px, calc(100vw - 32px))",
            },
          },
        }}
      >
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogTitle>Settings for {variant}</DialogTitle>
          <DialogContent sx={{ overflowX: "hidden" }}>
            {variant === "projection" && (
              <KLineChartProjectionSettings
                control={
                  form.control as unknown as Control<
                    ChartSettings["projection"]
                  >
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
            <Stack direction="row" spacing={0.5} sx={{ mr: "auto" }}>
              <Tooltip title="Copy settings">
                <IconButton onClick={handleCopy} size="small" type="button">
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Paste settings">
                <IconButton onClick={handlePaste} size="small" type="button">
                  <ContentPaste fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
