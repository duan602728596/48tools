import * as NodeMediaServer from 'node-media-server';
import { getFFmpeg } from './utils';

/* 启动服务，将rtmp转换成flv */
const config: object = {
  rtmp: {
    port: 25000,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 25001,
    allow_origin: '*'
  },
  trans: {
    ffmpeg: getFFmpeg()
  }
};

const server: NodeMediaServer = new NodeMediaServer(config);

server.run();