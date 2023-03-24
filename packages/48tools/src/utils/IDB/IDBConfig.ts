/* 数据库配置 */
export interface ObjectStoreItem {
  name: string;
  key: string;
  data: Array<string>;
}

export interface IDBConfig {
  name: string;
  version: number;
  objectStore: Array<ObjectStoreItem>;
}

const dbConfig: IDBConfig = {
  name: '48tools',
  version: 8,
  objectStore: [
    // 0：b站直播间信息
    {
      name: 'bilibili_live',
      key: 'id',
      data: ['description', 'roomId', 'autoRecord']
    },

    // 1：a站直播间信息
    {
      name: 'acfun_live',
      key: 'id',
      data: ['description', 'roomId']
    },

    // 2：一些配置
    {
      name: 'options',
      key: 'name',
      data: ['value']
    },

    // 3：微博登陆列表
    {
      name: 'weibo_login_list',
      key: 'id',
      data: ['username', 'cookie', 'lastLoginTime']
    },

    // 4：ffmpeg命令模板
    {
      name: 'ffmpeg_template',
      key: 'id',
      data: ['name', 'args']
    },

    // 5：48房间电台
    {
      name: '48_room_voice',
      key: 'id',
      data: ['channelId', 'serverId', 'nickname']
    },

    // 6：抖音直播间信息
    {
      name: 'douyin_live',
      key: 'id',
      data: ['description', 'roomId']
    }
  ]
};

export default dbConfig;