// @flow
/* 配置文件 */
const path = node_require('path');
const process = node_require('process');
const execPath = path.dirname(process.execPath).replace(/\\/g, '/');

type inforMap = {
  name: string,
  key: string,
  data: {
    name: string,
    index: string
  }[]
};

type indexeddbMap = {
  name: string,
  version: number,
  objectStore: {
    liveCatch: inforMap,
    bilibili: inforMap
  }
};

const option: {
  indexeddb: indexeddbMap,
  ffmpeg: string,
  output: string
} = {
  // 数据库
  indexeddb: {
    name: '48tools',
    version: 2,
    objectStore: {
      liveCatch: {
        name: 'liveCatch',         // 视频直播页面
        key: 'function',           // liveCacheOption 视频自动抓取配置
        data: [
          {
            name: 'option',
            index: 'option'
          }
        ]
      },
      bilibili: {
        name: 'bilibili',          // B站直播间抓取
        key: 'roomid',
        data: [
          {
            name: 'roomname',
            index: 'roomname'
          }
        ]
      }
    }
  },
  // ffmpeg
  ffmpeg: `${ execPath }/dependent/ffmpeg/ffmpeg.exe`,
  output: `${ execPath }/output`
};

export default option;