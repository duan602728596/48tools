import { ipcRenderer } from 'electron';
import { ProxyServerChannel } from '@48tools/main/src/channelEnum';
import { detectPort } from '../utils';

let start: boolean = false;
let startLock: boolean = false;

/* 端口号 */
export interface ProxyServerPort {
  port: number;
}

const netMediaServerPort: ProxyServerPort = {
  port: 25110
};

export function getProxyServerPort(): ProxyServerPort {
  return netMediaServerPort;
}

/* 启动服务，将rtmp转换成flv */
export async function proxyServerInit(): Promise<void> {
  if (start || startLock) return;

  startLock = true;

  try {
    netMediaServerPort.port = await detectPort(netMediaServerPort.port);

    // 等待渲染线程启动后，发送消息到主线程，启动proxy-server服务
    ipcRenderer.send(ProxyServerChannel.ProxyServer, {
      port: netMediaServerPort.port
    });
    start = true;
  } catch (err) {
    console.error(err);
  }

  startLock = false;
}