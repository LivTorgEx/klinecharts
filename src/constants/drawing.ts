import { DrawingDataSourceItem } from "../types/drawing";

// TODO: list of future drawings

export function createSingleLineOptions(): DrawingDataSourceItem[] {
  return [
    {
      key: "horizontalStraightLine",
      text: "Horizontal Straight Line",
    },
    { key: "horizontalRayLine", text: "Horizontal Ray Line" },
    { key: "horizontalSegment", text: "Horizontal Segment" },
    {
      key: "verticalStraightLine",
      text: "Vertical Straight Line",
    },
    { key: "verticalRayLine", text: "Vertical Ray Line" },
    { key: "verticalSegment", text: "Vertical Segment" },
    { key: "straightLine", text: "Straight Line" },
    { key: "rayLine", text: "Ray Line" },
    { key: "segment", text: "Segment" },
    { key: "arrow", text: "Arrow" },
    { key: "priceLine", text: "Price Line" },
  ];
}

export function createMoreLineOptions(): DrawingDataSourceItem[] {
  return [
    { key: "priceChannelLine", text: "Price Channel Line" },
    {
      key: "parallelStraightLine",
      text: "Parallel Straight Line",
    },
  ];
}

export function createPolygonOptions(): DrawingDataSourceItem[] {
  return [
    { key: "circle", text: "Circle" },
    { key: "rect", text: "Rect" },
    { key: "parallelogram", text: "Parallelogram" },
    { key: "triangle", text: "Triangle" },
  ];
}

export function createFibonacciOptions(): DrawingDataSourceItem[] {
  return [
    { key: "fibonacciLine", text: "Fibonacci line" },
    { key: "fibonacciSegment", text: "Fibonacci segment" },
    { key: "fibonacciCircle", text: "Fibonacci circle" },
    { key: "fibonacciSpiral", text: "Fibonacci spiral" },
    {
      key: "fibonacciSpeedResistanceFan",
      text: "Fibonacci speed resistance fan",
    },
    { key: "fibonacciExtension", text: "Fibonacci extension" },
    { key: "gannBox", text: "Gann box" },
  ];
}

export function createWaveOptions(): DrawingDataSourceItem[] {
  return [
    { key: "xabcd", text: "xabcd" },
    { key: "abcd", text: "abcd" },
    { key: "threeWaves", text: "Three waves" },
    { key: "fiveWaves", text: "Five waves" },
    { key: "eightWaves", text: "Eight waves" },
    { key: "anyWaves", text: "Any waves" },
  ];
}

export function createMagnetOptions(): DrawingDataSourceItem[] {
  return [
    { key: "weak_magnet", text: "Weak magnet" },
    { key: "strong_magnet", text: "Strong magnet" },
  ];
}
