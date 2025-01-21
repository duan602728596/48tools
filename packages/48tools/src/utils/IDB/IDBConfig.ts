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

export const objectStoreMaps: Record<
  'bilibiliLive'
  | 'acfunLive'
  | 'options'
  | 'weiboLoginList'
  | 'ffmpegTemplate'
  | 'pocket48RoomVoice'
  | 'douyinLive'
  | 'kuaishouLive'
  | 'pocket48UserInfo'
  | 'showroomLive',
  ObjectStoreItem
> = {
  // 0：b站直播间信息
  bilibiliLive: {
    name: 'bilibili_live',
    key: 'id',
    data: ['description', 'roomId', 'autoRecord']
  },

  // 1：a站直播间信息
  acfunLive: {
    name: 'acfun_live',
    key: 'id',
    data: ['description', 'roomId', 'autoRecord']
  },

  // 2：一些配置
  options: {
    name: 'options',
    key: 'name',
    data: ['value']
  },

  // 3：微博登陆列表
  weiboLoginList: {
    name: 'weibo_login_list',
    key: 'id',
    data: ['username', 'cookie', 'lastLoginTime', 's', 'from', 'c']
  },

  // 4：ffmpeg命令模板
  ffmpegTemplate: {
    name: 'ffmpeg_template',
    key: 'id',
    data: ['name', 'args']
  },

  // 5：48房间电台
  pocket48RoomVoice: {
    name: '48_room_voice',
    key: 'id',
    data: ['channelId', 'serverId', 'nickname', 'autoRecord']
  },

  // 6：抖音直播间信息
  douyinLive: {
    name: 'douyin_live',
    key: 'id',
    data: ['description', 'roomId', 'autoRecord']
  },

  // 7：快手直播间信息
  kuaishouLive: {
    name: 'kuaishou_live',
    key: 'id',
    data: ['description', 'roomId', 'autoRecord']
  },

  // 8: 房间信息
  pocket48UserInfo: {
    name: '48_user_info',
    key: 'id',
    data: ['userId', 'serverId', 'channelId', 'liveRoomId', 'description']
  },

  // 9: showroom-live
  showroomLive: {
    name: 'showroom_live',
    key: 'id',
    data: ['description', 'roomId', 'autoRecord']
  }
};

const dbConfig: IDBConfig = {
  name: '48tools',
  version: 18,
  objectStore: Object.values<ObjectStoreItem>(objectStoreMaps)
};

export default dbConfig;