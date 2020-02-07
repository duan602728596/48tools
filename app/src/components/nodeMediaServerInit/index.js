import option from '../option/option';
const NodeMediaServer = global.require('node-media-server');

function nodeMediaServerInit() {
  const config = {
    rtmp: {
      port: 15000,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: 15001,
      allow_origin: '*'
    },
    trans: {
      ffmpeg: option.ffmpeg
    }
  };

  const server = new NodeMediaServer(config);

  server.run();
}

nodeMediaServerInit();