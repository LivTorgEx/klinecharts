import { KLineData } from "klinecharts";
type StochasticOutput = {
    k: number;
    d: number;
};
export declare class Stochastic {
    private period;
    private lowest;
    private highest;
    private smothK;
    private smothD;
    constructor(period: number, smothK: number, smothD: number);
    next(input: KLineData): StochasticOutput;
}
export {};
