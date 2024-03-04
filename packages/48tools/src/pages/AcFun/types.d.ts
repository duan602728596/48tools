/* ========== Download ========== */
export interface Representation {
  m3u8Slice: string;
  url: string;
  qualityLabel: string;
}

export interface KsPlayJson {
  adaptationSet: Array<{
    duration: number;
    id: number;
    representation: Array<Representation>;
  }>;
}

export interface VideoInfo {
  fileName: string;
  id: string;
}

export interface VideoInfoWithKey extends VideoInfo {
  key: string;
  pageIndex: number;
}

export interface PageInfo {
  currentVideoInfo: {
    ksPlayJson: string;
  };
  videoList: Array<VideoInfo>;
}

export interface DownloadItem {
  qid: string;       // 当前的下载id，随机
  type: 'ac' | 'aa'; // 下载类型
  id: string;        // 视频id
  representation: Array<Representation>; // 下载的列表
}

/* ========== Live ========== */
export interface LiveRepresentation {
  url: string;
  name: string; // 清晰度
}

export interface LiveVideoPlayRes {
  liveAdaptiveConfig: string;
  liveAdaptiveManifest: Array<{
    adaptationSet: {
      representation: Array<LiveRepresentation>;
    };
  }>;
}