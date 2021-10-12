import type { FieldData } from 'rc-field-form/es/interface';
import type { WebWorkerChildItem } from '../../types';

export interface InLiveFormValue {
  type?: string;
  live?: string;
  quality: string;
}

/* ========== live48 ========== */
// 公演直播抓取列表
export interface InLiveWebWorkerItem {
  id: string;
  type: string;
  live: string;
  quality: string;
  playStreamPath: string;
  status?: number;
  timer?: NodeJS.Timeout; // 定时器，监听直播是否开始
  worker?: Worker;
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
  description: string;
  liveType: string;
}

export interface InVideoWebWorkerItem extends WebWorkerChildItem {
  liveType: string;
}

export interface RecordFieldData extends FieldData {
  value: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

// 录播的webworker下载
export interface RecordVideoDownloadWebWorkerItem extends WebWorkerChildItem {
  isM3u8?: boolean; // 是否为m3u8
  downloadType: 0 | 1;
}