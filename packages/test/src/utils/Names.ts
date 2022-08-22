/**
 * 返回一个新的name
 */
class Names {
  basic: string;
  testNames: Array<string>;
  index: number = 0;

  constructor(basic: string, n: Array<string>) {
    this.basic = basic;
    this.testNames = n;
  }

  get name(): string {
    const n: string = this.testNames[this.index];

    this.index += 1;

    return `${ this.basic }/${ n }`;
  }
}

export default Names;