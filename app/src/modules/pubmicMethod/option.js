/* 配置文件 */
export default {
  // 数据库
  indexeddb: {
    name: '48tools',
    version: 1,
    objectStore: {
      liveCache: {
        name: 'liveCache',         // 视频直播页面
        key: 'function',           // liveCacheOption 视频自动抓取配置
        data: [
          {
            name: 'option',
            index: 'option'
          }
        ]
      }
    }
  }
};