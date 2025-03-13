import { ErrorLevel } from './enum';

// 视频列表的详细信息
export interface BilibiliVideoInfoItem {
  videoUrl: string;
  audioUrl?: string;
  quality: number; // 分辨率
  qualityDescription: string;
}

// 解析的视频列表
export interface BilibiliVideoResultItem {
  title: string; // 副标题
  cover: string; // 封面
  aid: number;
  bvid: string;
  cid: number;
  page: number;
  videoInfo: Array<BilibiliVideoInfoItem>;
  cheeseInfo?: {
    epid: number;
    canRequest: boolean; // 判断是否能够请求
  };
}

// 错误
interface ScrapyError {
  level: ErrorLevel;
  message: string;
}