export interface LiveInfo {
  title: string;
  list: Array<PlayUrlItem>;
}

/* 快手直播 */
export interface PlayUrlItem {
  url: string;
  qualityType: 'STANDARD' | 'HIGH' | 'SUPER' | 'BLUE_RAY';
  name: '高清' | '超清' | '蓝光 4M' | '蓝光 8M';
}

/* 快手视频地址 */
export interface KuaishouLiveInitialState {
  liveroom: {
    liveStream: {
      caption: string;
      playUrls: Array<{
        adaptationSet: {
          representation: Array<PlayUrlItem>;
        };
      }>;
    };
  };
}

export interface DownloadItem {
  qid: string;
  url: string;
  title: string;
}