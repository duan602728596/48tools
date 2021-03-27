import { workerData } from 'worker_threads';
import { addAsarToLookupPaths, register } from 'asar-node';
import type * as NodeMediaServer from 'node-media-server';
import type { NodeMediaServerArg } from './nodeMediaServer';

interface WorkerData extends NodeMediaServerArg {
  isDevelopment: boolean;
}

/* 新线程启动服务，将rtmp转换成flv */
const { ffmpeg, rtmpPort, httpPort, isDevelopment }: WorkerData = workerData;

let NodeMediaServerModule: NodeMediaServer;

if (isDevelopment) {
  NodeMediaServerModule = require('node-media-server');
} else {
  register();
  addAsarToLookupPaths();

  // eslint-disable-next-line import/no-unresolved
  NodeMediaServerModule = require('../../../../app.asar/node_modules/node-media-server/node_media_server.js');
}

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

const server: NodeMediaServer = new NodeMediaServerModule(config);

server.run();