import { KLineData } from "klinecharts";
export declare class SuperTrend {
    private multiplier;
    private atr;
    private superTrend?;
    private direction;
    constructor(period: number, multiplier: number);
    next(input: KLineData): number;
}
