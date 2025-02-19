import { env } from 'node:process';
import { workerData } from 'node:worker_threads';
import NodeMediaServer from 'node-media-server';
import type { NodeMediaServerArg } from './nodeMediaServer.mjs';

env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface WorkerData extends NodeMediaServerArg {
  isDevelopment: boolean;
}

/* 新线程启动服务，将rtmp转换成flv */
const { ffmpeg, rtmpPort, httpPort }: WorkerData = workerData;

// node-media-server
const server: NodeMediaServer = new NodeMediaServer({
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