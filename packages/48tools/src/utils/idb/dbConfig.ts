/* 数据库配置 */
export interface ObjectStoreItem {
  name: string;
  key: string;
  data: Array<string>;
}

export interface DbConfig {
  name: string;
  version: number;
  objectStore: Array<ObjectStoreItem>;
}

const dbConfig: DbConfig = {
  name: '48tools',
  version: 3,
  objectStore: [
    // b站直播间信息
    {
      name: 'bilibili_live',
      key: 'id',
      data: ['description', 'roomId']
    },

    // a站直播间信息
    {
      name: 'acfun_live',
      key: 'id',
      data: ['description', 'roomId']
    },

    // 一些配置
    {
      name: 'options',
      key: 'name',
      data: ['value']
    }
  ]
};

export default dbConfig;