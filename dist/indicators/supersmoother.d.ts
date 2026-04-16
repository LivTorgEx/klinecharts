export declare class Supersmoother {
    private period;
    private srcStack;
    private ssStack;
    constructor(period: number);
    next(src: number): number;
}
