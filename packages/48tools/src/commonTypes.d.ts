/* webworker进程 */
export interface WebWorkerChildItem {
  id: string;
  worker: Worker;
}

/* worker进程发出的数据 */
export type MessageEventData = {
  type: 'close' | 'error';
  error?: Error;
}

export type LiveStatusEventData = {
  type: 'live_status';
  liveId: string;
  roomId: string;
  rid: string;
};

/* 微博账号数据库内的数据 */
export interface WeiboAccount {
  id: string;
  username: string;
  cookie: string;
  lastLoginTime: string; // 最后登陆时间
  s: string | undefined;
  from: string | undefined;
  c: string | undefined;
}

/* 直播 */
export interface LiveItem {
  id: string;
  description: string;
  roomId: string;
  autoRecord?: boolean;
}