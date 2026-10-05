import { Button } from "@livtorgex/ui-kit";
import { Ruler, ScanLine, Spline } from "lucide-react";
import { useChart } from "../context/chart";

export function KLineChartSidePanel() {
  const chart = useChart();
  const tools = [
    { name: "fibonacciLine", label: "Fibonacci line", icon: Spline },
    { name: "horizontalRayLine", label: "Horizontal ray", icon: ScanLine },
    { name: "measure", label: "Measure", icon: Ruler },
  ];

  return (
    <div className="flex shrink-0 flex-col border-r border-gray-800 py-1">
      {tools.map(({ name, label, icon: Icon }) => (
        <Button
          key={name}
          type="button"
          variant="icon-ghost"
          size="sm"
          aria-label={label}
          className="rounded-none"
          onClick={() => chart?.createOverlay({ name })}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
