import * as net from 'node:net';
import type { Server as NetServer } from 'node:net';
import { ipcRenderer } from 'electron';
import { getFFmpeg } from '../utils';

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

/**
 * 检查端口占用情况
 * @param { number } port: 检查的端口
 */
function portIsOccupied(port: number): Promise<boolean> {
  return new Promise(function(resolve: Function, reject: Function): void {
    const server: NetServer = net.createServer().listen(port);

    server.on('listening', (): void => {
      server.close();
      resolve(true);
    });

    server.on('error', (err: Error): void => {
      server.close();
      resolve(false);
    });
  });
}

/**
 * 判断端口是否被占用，并返回新的端口
 * @param { number } port: 检查的端口
 * @param { Array<number> } ignorePort: 忽略的端口
 */
async function detectPort(port: number, ignorePort: Array<number> = []): Promise<number> {
  let maxPort: number = port + 10; // 最大端口
  let newNumber: number = port,    // 使用的端口
    pt: number = port;

  if (maxPort > 65535) {
    maxPort = 65535;
  }

  while (pt <= maxPort) {
    const portCanUse: boolean = await portIsOccupied(pt);

    if (portCanUse && !ignorePort.includes(pt)) {
      newNumber = pt;
      break;
    } else {
      pt++;
    }
  }

  return newNumber;
}

/* 启动服务，将rtmp转换成flv */
export async function netMediaServerInit(): Promise<void> {
  netMediaServerPort.rtmpPort = await detectPort(netMediaServerPort.rtmpPort);
  netMediaServerPort.httpPort = await detectPort(netMediaServerPort.httpPort, [netMediaServerPort.rtmpPort]);

  // 等待渲染线程启动后，发送消息到主线程，启动node-media-server服务
  ipcRenderer.send('node-media-server', {
    ffmpeg: getFFmpeg(),
    rtmpPort: netMediaServerPort.rtmpPort,
    httpPort: netMediaServerPort.httpPort
  });
}