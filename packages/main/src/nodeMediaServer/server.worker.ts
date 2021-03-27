import { workerData } from 'worker_threads';
import * as NodeMediaServer from 'node-media-server';
import type { NodeMediaServerArg } from './nodeMediaServer';

interface WorkerData extends NodeMediaServerArg {
  isDevelopment: boolean;
}

/* 新线程启动服务，将rtmp转换成flv */
const { ffmpeg, rtmpPort, httpPort, isDevelopment }: WorkerData = workerData;
const config: object = {
  logType: isDevelopment ? 3 : 1,
  rtmp: {
    port: rtmpPort,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: httpPort,
    allow_origin: '*'
  },
  trans: {
    ffmpeg
  }
};

const server: NodeMediaServer = new NodeMediaServer(config);

server.run();