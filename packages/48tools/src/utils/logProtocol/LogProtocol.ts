/* 断点日志 */
class LogProtocol {
  public type: string;
  public broadcastChannel: BroadcastChannel = new BroadcastChannel('log://');

  /**
   * @param { string } type - 日志类型
   */
  constructor(type: string) {
    this.type = type;
  }

  /**
   * 发送断点消息
   * @param { string } fn - 方法名字
   * @param { D } data - 上报数据
   */
  post<D>(fn: string, data: D): void {
    this.broadcastChannel.postMessage({
      type: this.type,
      fn,
      data: JSON.stringify(data)
    });
  }
}

export default LogProtocol;