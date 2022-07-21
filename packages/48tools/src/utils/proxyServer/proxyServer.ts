import { ipcRenderer } from 'electron';
import { detectPort } from '../utils';

let start: boolean = false;

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
  if (start) return;

  netMediaServerPort.port = await detectPort(netMediaServerPort.port);

  // 等待渲染线程启动后，发送消息到主线程，启动proxy-server服务
  ipcRenderer.send('proxy-server', {
    port: netMediaServerPort.port
  });
  start = true;
}