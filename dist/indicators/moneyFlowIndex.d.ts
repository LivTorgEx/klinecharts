import { KLineData } from "klinecharts";
export declare class MoneyFlowIndex {
    private period;
    private index;
    private count;
    private previousTypicalPrice;
    private totalPositiveMoneyFlow;
    private totalNegativeMoneyFlow;
    private deque;
    constructor(period: number);
    next(input: KLineData): number;
}
