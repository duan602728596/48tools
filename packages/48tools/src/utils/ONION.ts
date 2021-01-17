interface TaskFunc {
  (ctx: { [key: string]: any }, next: Function): void | Promise<void>;
}

/* 洋葱模型 */
class ONION {
  public tasks: Array<TaskFunc>;

  constructor() {
    this.tasks = []; // 执行的方法队列
  }

  // 将方法添加到队列
  use(...taskFunc: Array<TaskFunc>): void {
    this.tasks.push(...taskFunc);
  }

  // 最中心执行的函数
  do(ctx: { [key: string]: any }): Function {
    return async (): Promise<void> => { /* do something */ };
  }

  // 创建洋葱模型
  createNext(ctx: { [key: string]: any }, i: number): Function {
    return async (): Promise<void> => {
      return await this.tasks[i](
        ctx, i === (this.tasks.length - 1)
          ? this.do(ctx)
          : this.createNext(ctx, i + 1)
      );
    };
  }

  // 执行方法
  async run(ctx?: { [key: string]: any }): Promise<void> {
    await this.createNext(Object.assign({}, ctx), 0)();
  }
}

export default ONION;