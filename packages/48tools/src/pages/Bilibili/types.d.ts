import type { DashSupportFormats, DashVideoInfo } from '@48tools-api/bilibili/download';

/* ========== Download ========== */
export interface DownloadItem {
  qid: string;              // 当前的下载id，随机
  type: 'bv' | 'av' | 'au'; // 下载类型
  id: string;               // 视频：av、bv的id，音频：au的id
  page: number;             // 分页
  durl: string;             // 下载地址
  pic?: string;             // 封面图
  dash?: {
    video: string;
    audio: string;
  };
  title?: string;
}

// b站页面上的视频信息
export interface InitialState {
  aid: number;
  videoData: {
    aid: number;  // av号
    bvid: string; // bv号
    pages: Array<{
      cid: number;
      part: string; // 分part的标题
    }>;
    title: string;
  };
  epInfo: {
    aid: number;
    cid: number;
  };
}

// 番剧__NEXT_DATA__的数据结构
export interface VideoOnceInfoResult {
  play_view_business_info: {
    episode_info: {
      aid: number;
      bvid: string;
      cid: number;
      long_title: string;
      title: string;
    };
  };
  video_info: {
    dash: DashVideoInfo;
    support_formats: Array<DashSupportFormats>;
  };
}

export interface VideoOnceInfo {
  state: {
    data: {
      result: VideoOnceInfoResult;
    };
  };
}

export interface VideoEpInfo {
  state: {
    cover: string;
    season_title: string;
  };
}

export interface NextData {
  props: {
    pageProps: {
      dehydratedState: {
        queries: [VideoOnceInfo, VideoEpInfo];
      };
    };
  };
}

// 进度条信息
export interface ProgressEventData {
  percent: number;
  transferred: number;
  total: number;
}

// dash
interface DashInfo {
  dash: DashVideoInfo;
  supportFormats: Array<DashSupportFormats>;
  pic: string;
  title: string;
}