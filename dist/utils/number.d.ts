export declare function formatNum(amount: number, precision?: number): string;
export declare function toMeasurePrice(prev_price: number, price: number): number;
export declare function roundToNearestPrice(price: number, interval?: number): number;
export declare function toChartY(price: number, zeroPrice: number, gapY: number): number;
export declare function toChartX(time: string | number, timeStart: number, timeframe: number, gapBar: number): number;
export declare function format_tf(value: number | string): string;
export declare function formatBigNumber(volume: number, unit?: string): string;
export declare function parseInputFloat<T extends number | null = null>(value: string, initial?: T): T | number;
export declare function parseInputInt(value: string): null | number;
