export declare class Accumulator {
    private period;
    private index;
    private acc;
    private deque;
    constructor(period: number);
    next(input: number): number;
}
