/**
 * 配置文件
 *
 * @flow
 */
const fs: Object = global.require('fs');
const path: Object = global.require('path');
const process: Object = global.require('process');
const os: Object = global.require('os');

/**
 * 获取运行地址
 */
export const type: string = os.type();
export const execPath: string = /* ::` */ do /* ::`; */ {
  let ep: string = '';

  switch (type) {
    // mac
    case 'Darwin':
      // 兼容开发环境
      const p: ?string[] = process.execPath.match(/^[^\.]+\.app/);
      const p2: string[] = p ? p[0].split(/\//) : [];

      ep = path.join(p2.join('/'), 'Contents');
      break;
    // win32
    default:
      ep = path.dirname(process.execPath).replace(/\\/g, '/');
      break;
  }
  ep;
};

type InforMap = {
  name: string,
  key: string,
  data: {
    name: string,
    index: string
  }[]
};

type IndexeddbMap = {
  name: string,
  version: number,
  objectStore: {
    liveCatch: InforMap,
    bilibili: InforMap
  }
};

const option: {
  indexeddb: IndexeddbMap,
  ffmpeg: string,
  output: string
} = {
  // 数据库
  indexeddb: {
    name: '48tools',
    version: 2,
    objectStore: {
      liveCatch: {
        name: 'liveCatch', // 视频直播页面
        key: 'function', // liveCacheOption 视频自动抓取配置
        data: [
          {
            name: 'option',
            index: 'option'
          }
        ]
      },
      bilibili: {
        name: 'bilibili', // B站直播间抓取
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
  ffmpeg: `${ execPath }/dependent/ffmpeg/ffmpeg`,
  output: ((): string => {
    const outputPathFile: string = /* ::` */ do /* ::`; */ {
      if (type === 'Darwin') {
        // 获取downloads文件夹路径
        const username: string = fs.readdirSync('/Users');

        path.join('/Users', username[username.length - 1], '/Downloads');
      } else {
        `${ execPath }/output`;
      }
    };

    return outputPathFile;
  })()
};

export default option;