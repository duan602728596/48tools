import type { ReactElement, JSXElementConstructor } from 'react';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { MessageInstance } from 'antd/es/message/interface';

export type UseModalReturnType = [Omit<ModalStaticFunctions, 'warn'>, ReactElement];
export type UseMessageReturnType = [MessageInstance, ReactElement<any, string | JSXElementConstructor<any>>];

// webworker进程
export interface WebWorkerChildItem {
  id: string;
  worker: Worker;
}

// worker进程发出的数据
export type MessageEventData = {
  type: 'close' | 'error';
  error?: Error;
};

// 微博账号数据库内的数据
export interface WeiboAccount {
  id: string;
  username: string;
  cookie: string;
  lastLoginTime: string; // 最后登陆时间
}

export interface IDBActionFunc {
  (ActionResult: any): any;
}