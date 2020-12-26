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