import { ipcRenderer } from 'electron';
import { getFFmpeg, detectPort } from '../utils';

let start: boolean = false;

/* 端口号 */
export interface NetMediaServerPort {
  rtmpPort: number;
  httpPort: number;
}

const netMediaServerPort: NetMediaServerPort = {
  rtmpPort: 25000,
  httpPort: 25001
};

export function getNetMediaServerPort(): NetMediaServerPort {
  return netMediaServerPort;
}

/* 启动服务，将rtmp转换成flv */
export async function netMediaServerInit(): Promise<void> {
  if (start) return;

  netMediaServerPort.rtmpPort = await detectPort(netMediaServerPort.rtmpPort);
  netMediaServerPort.httpPort = await detectPort(netMediaServerPort.httpPort, [netMediaServerPort.rtmpPort]);

  // 等待渲染线程启动后，发送消息到主线程，启动node-media-server服务
  ipcRenderer.send('node-media-server', {
    ffmpeg: getFFmpeg(),
    rtmpPort: netMediaServerPort.rtmpPort,
    httpPort: netMediaServerPort.httpPort
  });
  start = true;
}