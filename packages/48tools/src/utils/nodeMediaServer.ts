import * as net from 'net';
import type { Server as NetServer } from 'net';
import * as NodeMediaServer from 'node-media-server';
import { getFFmpeg } from './utils';

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
  netMediaServerPort.httpPort = await detectPort(netMediaServerPort.httpPort);

  const config: object = {
    rtmp: {
      port: netMediaServerPort.rtmpPort,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: netMediaServerPort.httpPort,
      allow_origin: '*'
    },
    trans: {
      ffmpeg: getFFmpeg()
    }
  };

  const server: NodeMediaServer = new NodeMediaServer(config);

  server.run();
}