/**
 * 配置文件
 */
const fs = global.require('fs');
const path = global.require('path');
const process = global.require('process');
const os = global.require('os');

/**
 * 获取运行地址
 */
export const type = os.type();
export const execPath = do {
  let ep = '';

  switch (type) {
    // mac
    case 'Darwin':
      // 兼容开发环境
      const p = process.execPath.match(/^[^\.]+\.app/);
      const p2 = p ? p[0].split(/\//) : [];

      ep = path.join(p2.join('/'), 'Contents');
      break;
    // win32
    default:
      ep = path.dirname(process.execPath).replace(/\\/g, '/');
      break;
  }
  ep;
};

const option = {
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
  output: (() => {
    const outputPathFile = do {
      if (type === 'Darwin') {
        // 获取downloads文件夹路径
        const username = fs.readdirSync('/Users');

        path.join('/Users', username[username.length - 1], '/Downloads');
      } else {
        `${ execPath }/output`;
      }
    };

    return outputPathFile;
  })()
};

export default option;