import { KLineData } from "klinecharts";
export declare class ParabolicStopAndReverse {
    private start;
    private increment;
    private maximum;
    private af;
    private maxAf;
    private afStep;
    private isUptrend;
    private sar;
    private ep;
    constructor(start: number, increment: number, maximum: number);
    initializeWithCandle(input: KLineData): number;
    next(input: KLineData): number;
}
