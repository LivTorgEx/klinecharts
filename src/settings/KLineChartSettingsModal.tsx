import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button, Dialog, ToggleField } from "@livtorgex/ui-kit";

import { useChartSettings } from "../context/chartSettings";
import { partialUpdateChartSettings } from "../utils/chart";

type Props = {
  name: string;
};

export function KLineChartSettingsModal({ name }: Props) {
  const settings = useChartSettings();
  const [open, setOpen] = useState(false);

  function updateSettings(update: {
    orderBook?: { show: boolean };
    orderHistory?: { show: boolean };
    position?: { showFinished: boolean };
  }) {
    partialUpdateChartSettings(name, update);
    window.dispatchEvent(
      new CustomEvent("klinechart:settings-updated", { detail: { name } })
    );
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="rounded-none px-2 text-gray-300"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Settings2 className="mr-1 h-4 w-4" />
        Settings
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Chart settings"
        className="w-[min(92vw,420px)] rounded-none border-gray-700 bg-[#0b0c0e] text-gray-200"
      >
        <div>
          <ToggleField
            label="Order book lines"
            aria-label="Order book lines"
            checked={settings.orderBook.show}
            onChange={(event) =>
              updateSettings({
                orderBook: { show: event.currentTarget.checked },
              })
            }
          />
          <ToggleField
            label="Historical orders"
            aria-label="Historical orders"
            checked={settings.orderHistory.show}
            onChange={(event) =>
              updateSettings({
                orderHistory: { show: event.currentTarget.checked },
              })
            }
          />
          <ToggleField
            label="Historical positions"
            aria-label="Historical positions"
            checked={settings.position.showFinished}
            onChange={(event) =>
              updateSettings({
                position: { showFinished: event.currentTarget.checked },
              })
            }
          />
        </div>
      </Dialog>
    </>
  );
}
