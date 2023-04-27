/* 断点日志 */
class LogProtocol {
  public type: string;
  public broadcastChannel: BroadcastChannel = new BroadcastChannel('log://');

  constructor(type: string) {
    this.type = type;
  }

  // 发送断点消息
  post<D>(fn: string, data: D): void {
    this.broadcastChannel.postMessage({
      type: this.type,
      fn,
      data: JSON.stringify(data)
    });
  }
}

export default LogProtocol;