import { KLineData } from "klinecharts";
type StochasticMomentumIndexValue = {
    smi: number;
    smiBasedEma: number;
};
export declare class StochasticMomentumIndex {
    private periodK;
    private smoothK;
    private smoothD;
    private doubleSmoothK;
    private doubleSmoothD;
    private smiBasedEma;
    private high;
    private low;
    constructor(periodK: number, periodD: number, periodEMA: number);
    next(input: KLineData): StochasticMomentumIndexValue;
}
export {};
