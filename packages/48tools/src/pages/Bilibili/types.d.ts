import type { BilibiliVideoType } from '../../scrapy/bilibili/enum';
import type { BilibiliVideoInfoItem } from '../../scrapy/bilibili/interface';

/* ========== Download ========== */
export interface DownloadItem {
  qid: string;             // 当前的下载id，随机
  type: BilibiliVideoType; // 下载类型
  id: string;              // 视频：av、bv的id，音频：au的id
  page: number;            // 分页
  durl: string;            // 下载地址
  pic?: string;            // 封面图
  dash?: {
    video: string;
    audio: string;
  };
  title?: string;
}

// 进度条信息
export interface ProgressEventData {
  percent: number;
  transferred: number;
  total: number;
}

// dash
interface DashInfoV2 {
  dash: Array<BilibiliVideoInfoItem>;
  type: BilibiliVideoType;
  id: string;
  title: string;
  page?: number;
  pic: string;
}