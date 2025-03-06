export interface LiveInfo {
  title: string;
  list: Array<PlayUrlItem>;
}

export interface ErrorInfo {
  error: string;
}

/* 快手直播 */
export interface PlayUrlItem {
  url: string;
  qualityType: 'STANDARD' | 'HIGH' | 'SUPER' | 'BLUE_RAY';
  name: '高清' | '超清' | '蓝光 4M' | '蓝光 8M';
}

/* 快手视频地址 */
export interface PlayUrl {
  adaptationSet: {
    representation: Array<PlayUrlItem>;
  };
}

export interface PlayListItem {
  liveStream: {
    caption: string;
    playUrls: {
      h264: PlayUrl;
      hevc: PlayUrl;
    };
  };
  errorType?: {
    title: string;
    content: string;
    type: number;
  };
}

export interface KuaishouLiveInitialState {
  liveroom: {
    playList: Array<PlayListItem>;
  };
}

export interface DownloadItem {
  qid: string;
  url: string;
  title: string;
}