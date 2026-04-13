import { IconButton, Stack } from "@mui/material";
import StraightenIcon from "@mui/icons-material/Straighten";

import { FibonacciLineIcon } from "../icons/FibonacciLineIcon";
import { useChart } from "../context/chart";
import { HorizontalRayLine } from "../icons/HorizontalRayLine";

export function KLineChartSidePanel() {
  const chart = useChart();

  return (
    <Stack>
      {[
        { name: "fibonacciLine", icon: FibonacciLineIcon },
        { name: "horizontalRayLine", icon: HorizontalRayLine },
        { name: "measure", icon: StraightenIcon },
      ].map(({ name, icon: Icon }) => (
        <IconButton
          key={name}
          sx={{ borderRadius: 0, padding: 0.25, margin: 0.5 }}
        >
          <Icon
            onClick={() => {
              chart?.createOverlay({ name });
            }}
          />
        </IconButton>
      ))}
    </Stack>
  );
}
