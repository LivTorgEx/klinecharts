import { KLineData } from "klinecharts";
type BlockType = "Bullish" | "Bearish";
interface Imbalance {
    timestamp: number;
    high: number;
    low: number;
    type: BlockType;
}
export declare class ImbalanceIndicator {
    private maxImbalances;
    private windowSize;
    private priceHistory;
    private imbalances;
    constructor(maxImbalances?: number);
    getImbalances(): Imbalance[];
    next(input: KLineData): void;
}
export {};
