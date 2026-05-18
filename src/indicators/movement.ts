import { getFigureClass, KLineData, registerIndicator } from "klinecharts";

type MovementDirection = "Long" | "Short";

interface MovementBlock {
  startIndex: number;
  endIndex: number;
  high: number;
  low: number;
  direction: MovementDirection;
}

interface MovementOutput {
  blocks: MovementBlock[];
}

function buildMovementBlocks(dataList: KLineData[]): MovementBlock[] {
  const blocks: MovementBlock[] = [];

  let currentDirection: MovementDirection | null = null;
  let blockStart = 0;
  let blockHigh = 0;
  let blockLow = Infinity;

  dataList.forEach((kLineData, idx) => {
    const buy = typeof kLineData["buy"] === "number" ? kLineData["buy"] : 0;
    const sell = typeof kLineData["sell"] === "number" ? kLineData["sell"] : 0;
    const direction: MovementDirection = buy >= sell ? "Long" : "Short";

    if (currentDirection === null) {
      currentDirection = direction;
      blockStart = idx;
      blockHigh = kLineData.high;
      blockLow = kLineData.low;
      return;
    }

    if (direction !== currentDirection) {
      blocks.push({
        startIndex: blockStart,
        endIndex: idx - 1,
        high: blockHigh,
        low: blockLow,
        direction: currentDirection,
      });
      currentDirection = direction;
      blockStart = idx;
      blockHigh = kLineData.high;
      blockLow = kLineData.low;
    } else {
      if (kLineData.high > blockHigh) blockHigh = kLineData.high;
      if (kLineData.low < blockLow) blockLow = kLineData.low;
    }
  });

  if (currentDirection !== null && dataList.length > 0) {
    blocks.push({
      startIndex: blockStart,
      endIndex: dataList.length - 1,
      high: blockHigh,
      low: blockLow,
      direction: currentDirection,
    });
  }

  return blocks;
}

registerIndicator<MovementOutput>({
  name: "movement",
  shortName: "Movement",
  series: "price",
  draw: ({ ctx, indicator, xAxis, yAxis, chart }) => {
    const { from, to } = chart.getVisibleRange();
    const { result } = indicator;
    const FigureRect = getFigureClass("rect")!;

    const last = result[result.length - 1];
    if (!last) {
      return false;
    }

    const { blocks } = last;

    const lastTwo = blocks.slice(-2);
    const historical = blocks.slice(0, -2);

    const avgSize =
      historical.length > 0
        ? historical.reduce((sum, b) => sum + (b.high - b.low), 0) /
          historical.length
        : 0;

    const lastTwoSet = new Set(lastTwo);
    const significant = blocks.filter(
      (b) =>
        lastTwoSet.has(b) || (avgSize > 0 && b.high - b.low >= avgSize * 0.6)
    );

    significant
      .filter((block) => block.endIndex >= from && block.startIndex <= to)
      .forEach((block) => {
        const xStart = xAxis.convertToPixel(block.startIndex);
        const xEnd = xAxis.convertToPixel(block.endIndex + 1);
        const width = xEnd - xStart;
        const yTop = yAxis.convertToPixel(block.high);
        const yBottom = yAxis.convertToPixel(block.low);
        const height = Math.abs(yBottom - yTop);

        const color =
          block.direction === "Long"
            ? "rgba(0,200,80,0.25)"
            : "rgba(220,50,50,0.25)";
        const borderColor =
          block.direction === "Long"
            ? "rgba(0,200,80,0.6)"
            : "rgba(220,50,50,0.6)";

        new FigureRect({
          name: "rect",
          attrs: { x: xStart, y: yTop, height, width },
          styles: {
            color,
            borderSize: 1,
            borderStyle: "solid",
            borderColor,
            borderRadius: 0,
          },
        }).draw(ctx);

        // Draw percentage label above the block (Long) or below (Short)
        const pct = ((block.high - block.low) / block.low) * 100;
        const label = `${pct.toFixed(1)}%`;
        const cx = xStart + width / 2;
        const labelY =
          block.direction === "Long" ? yTop - 5 : yTop + height + 14;
        ctx.save();
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 3;
        ctx.fillStyle =
          block.direction === "Long" ? "rgb(0,230,100)" : "rgb(255,80,80)";
        ctx.fillText(label, cx, labelY);
        ctx.restore();
      });

    return false;
  },
  calc: (dataList: KLineData[]): MovementOutput[] => {
    const blocks = buildMovementBlocks(dataList);
    return dataList.map(() => ({ blocks }));
  },
});
