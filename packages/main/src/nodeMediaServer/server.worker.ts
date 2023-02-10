import { workerData } from 'node:worker_threads';
import type * as NodeMediaServerType from 'node-media-server';
import asarNodeRequire from '../asarNodeRequire';
import type { NodeMediaServerArg } from './nodeMediaServer';

const NodeMediaServer: typeof NodeMediaServerType = asarNodeRequire('node-media-server');

interface WorkerData extends NodeMediaServerArg {
  isDevelopment: boolean;
}

/* 新线程启动服务，将rtmp转换成flv */
const { ffmpeg, rtmpPort, httpPort }: WorkerData = workerData;

// node-media-server
const server: NodeMediaServerType = new NodeMediaServer({
  logType: 1,
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
});

server.run();