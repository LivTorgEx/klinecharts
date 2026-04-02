export class Accumulator {
  private index: number = 0;
  private acc: number = 0;
  private deque: number[] = [];

  constructor(private period: number) {
    this.deque = new Array(period).fill(0);
  }

  next(input: number): number {
    this.acc += input;

    const popped = this.deque[this.index];
    this.acc -= popped;

    this.deque[this.index] = input;
    this.index = this.index + 1 < this.period ? this.index + 1 : 0;

    return this.acc;
  }
}
