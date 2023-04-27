/* 全局监听并发送消息 */
const broadcastChannel: BroadcastChannel = new BroadcastChannel('log://');

interface MessageEventData {
  type: string;
  fn: string;
  data: string;
}

function handleLogProtocolMessage(event: MessageEvent<MessageEventData>): void {
  const { type, fn, data }: MessageEventData = event.data;

  fetch(`log://post/?type=${ type }&fn=${ fn }`, {
    method: 'POST',
    body: data
  });
}

broadcastChannel.addEventListener('message', handleLogProtocolMessage);