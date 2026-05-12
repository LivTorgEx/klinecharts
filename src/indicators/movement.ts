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

    blocks
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
      });

    return false;
  },
  calc: (dataList: KLineData[]): MovementOutput[] => {
    const blocks = buildMovementBlocks(dataList);
    return dataList.map(() => ({ blocks }));
  },
});
