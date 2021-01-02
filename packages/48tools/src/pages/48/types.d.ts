import { WebWorkerChildItem } from '../../types';

/* ========== live48 ========== */
// 公演直播抓取列表
export interface InLiveWebWorkerItem extends WebWorkerChildItem {
  type: string;
  live: string;
  quality: string;
  playStreamPath: string;
  status?: number;
}

/* ========== pocket48 ========== */
// 直播自动录制配置
export interface Pocket48LiveAutoGrabOptions {
  time: number;
  users: string;
  dir: string;
}

/* ========== inVideo ========== */
export interface InVideoQuery {
  page: number;     // 当前页数
  total: number;    // 数据总数
  liveType: string;
}

export interface InVideoItem {
  title: string;
  id: string;
  liveType: string;
}

export interface InVideoWebWorkerItem extends WebWorkerChildItem {
  liveType: string;
}