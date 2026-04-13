export class Stack {
  private deque: number[] = [];

  constructor(private period: number) {
    this.deque = [];
  }

  get(idx: number): number | undefined {
    return this.deque[idx];
  }

  // Get value or use defaultValue or 0
  nz(idx: number, defaultValue?: number): number {
    return this.deque[idx] || defaultValue || 0;
  }

  next(input: number) {
    this.deque.unshift(input);

    if (this.deque.length > this.period) {
      this.deque.pop();
    }
  }
}
