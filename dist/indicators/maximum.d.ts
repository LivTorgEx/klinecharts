import { KLineData } from "klinecharts";
export declare class Maximum {
    private period;
    private maxIndex;
    private curIndex;
    private deque;
    constructor(period: number);
    findMaxIndex(): number;
    next(input: number | KLineData): number;
}
