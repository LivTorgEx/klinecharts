import { getFigureClass, KLineData, registerIndicator } from "klinecharts";

type MovementDirection = "Long" | "Short";

interface RawBlock {
  startIndex: number;
  endIndex: number;
  high: number;
  low: number;
  direction: MovementDirection;
}

interface BreakLevel {
  /** Price of the counter-move extreme (low for Long cascade, high for Short) */
  price: number;
  /** Horizontal midpoint index of the counter-move block */
  midIndex: number;
}

interface CascadeBlock {
  startIndex: number;
  endIndex: number;
  high: number;
  low: number;
  direction: MovementDirection;
  /** Break prices from absorbed counter-move blocks */
  breakLevels: BreakLevel[];
}

function buildRawBlocks(dataList: KLineData[]): RawBlock[] {
  const blocks: RawBlock[] = [];
  let currentDirection: MovementDirection | null = null;
  let blockStart = 0;
  let blockHigh = 0;
  let blockLow = Infinity;

  dataList.forEach((bar, idx) => {
    const buy = typeof bar["buy"] === "number" ? bar["buy"] : 0;
    const sell = typeof bar["sell"] === "number" ? bar["sell"] : 0;
    const direction: MovementDirection = buy >= sell ? "Long" : "Short";

    if (currentDirection === null) {
      currentDirection = direction;
      blockStart = idx;
      blockHigh = bar.high;
      blockLow = bar.low;
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
      blockHigh = bar.high;
      blockLow = bar.low;
    } else {
      if (bar.high > blockHigh) blockHigh = bar.high;
      if (bar.low < blockLow) blockLow = bar.low;
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

/**
 * Cascade-merge raw blocks: if a counter-direction block is "small" relative
 * to its neighbours (< cascadeThreshold fraction of avg neighbour size), absorb
 * it into the surrounding same-direction blocks.
 */
function cascadeMerge(
  rawBlocks: RawBlock[],
  cascadeThreshold: number
): CascadeBlock[] {
  if (rawBlocks.length === 0) return [];

  // Compute overall average raw block size for threshold reference
  const avgRaw =
    rawBlocks.reduce((s, b) => s + (b.high - b.low), 0) / rawBlocks.length;

  // Work on a mutable copy; we'll iterate until stable
  let working: (RawBlock & { breakLevels: BreakLevel[]; merged?: true })[] =
    rawBlocks.map((b) => ({ ...b, breakLevels: [] }));

  let changed = true;
  while (changed) {
    changed = false;
    const next: typeof working = [];

    let i = 0;
    while (i < working.length) {
      const prev = next[next.length - 1];
      const cur = working[i];
      const nxt = working[i + 1];

      // Try to absorb cur (counter-move) between prev and nxt if small enough
      if (
        prev &&
        nxt &&
        prev.direction === nxt.direction &&
        cur.direction !== prev.direction
      ) {
        const counterSize = cur.high - cur.low;
        const neighbourAvg = (prev.high - prev.low + (nxt.high - nxt.low)) / 2;
        const threshold = Math.min(neighbourAvg, avgRaw) * cascadeThreshold;

        if (counterSize <= threshold) {
          // Absorb counter block + next block into prev
          const breakLevel: BreakLevel = {
            price:
              cur.direction === "Short"
                ? cur.low // counter short → its low is the support break level
                : cur.high, // counter long → its high is the resistance break level
            midIndex: Math.round((cur.startIndex + cur.endIndex) / 2),
          };
          next[next.length - 1] = {
            ...prev,
            endIndex: nxt.endIndex,
            high: Math.max(prev.high, cur.high, nxt.high),
            low: Math.min(prev.low, cur.low, nxt.low),
            breakLevels: [
              ...prev.breakLevels,
              breakLevel,
              ...((nxt as typeof cur).breakLevels ?? []),
            ],
          };
          i += 2; // skip cur and nxt
          changed = true;
          continue;
        }
      }

      next.push(cur);
      i++;
    }

    working = next;
  }

  return working.map((b) => ({
    startIndex: b.startIndex,
    endIndex: b.endIndex,
    high: b.high,
    low: b.low,
    direction: b.direction,
    breakLevels: b.breakLevels,
  }));
}

interface CascadeOutput {
  blocks: CascadeBlock[];
}

registerIndicator<CascadeOutput>({
  name: "movementCascade",
  shortName: "Movement (Cascade)",
  series: "price",
  draw: ({ ctx, indicator, xAxis, yAxis, chart }) => {
    const { from, to } = chart.getVisibleRange();
    const { result } = indicator;
    const FigureRect = getFigureClass("rect")!;
    const FigureLine = getFigureClass("line")!;

    const last = result[result.length - 1];
    if (!last) return false;

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

        const isLong = block.direction === "Long";
        const color = isLong ? "rgba(0,200,80,0.2)" : "rgba(220,50,50,0.2)";
        const borderColor = isLong
          ? "rgba(0,200,80,0.7)"
          : "rgba(220,50,50,0.7)";
        const textColor = isLong ? "rgb(0,230,100)" : "rgb(255,80,80)";

        // Main rectangle
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

        // Break level dashed lines inside the block
        block.breakLevels.forEach((bl) => {
          const y = yAxis.convertToPixel(bl.price);
          if (y < yTop || y > yBottom) return; // outside visible rect
          new FigureLine({
            name: "line",
            attrs: {
              coordinates: [
                { x: xStart, y },
                { x: xEnd, y },
              ],
            },
            styles: {
              style: "dashed",
              size: 1,
              color: isLong ? "rgba(0,230,100,0.8)" : "rgba(255,80,80,0.8)",
              dashedValue: [4, 3],
            },
          }).draw(ctx);
        });

        // Percentage label above (Long) or below (Short)
        const pct = ((block.high - block.low) / block.low) * 100;
        const cascadeCount = block.breakLevels.length;
        const label =
          cascadeCount > 0
            ? `${pct.toFixed(1)}% ×${cascadeCount + 1}`
            : `${pct.toFixed(1)}%`;
        const cx = xStart + width / 2;
        const labelY = isLong ? yTop - 5 : yTop + height + 14;

        ctx.save();
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.shadowColor = "rgba(0,0,0,0.85)";
        ctx.shadowBlur = 3;
        ctx.fillStyle = textColor;
        ctx.fillText(label, cx, labelY);
        ctx.restore();
      });

    return false;
  },
  calc: (dataList: KLineData[]): CascadeOutput[] => {
    const raw = buildRawBlocks(dataList);
    const blocks = cascadeMerge(raw, 0.4);
    return dataList.map(() => ({ blocks }));
  },
});
