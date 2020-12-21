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
  version: 1,
  objectStore: [
    // b站直播间信息
    {
      name: 'bilibili_live',
      key: 'id',
      data: ['description', 'roomId']
    }
  ]
};

export default dbConfig;