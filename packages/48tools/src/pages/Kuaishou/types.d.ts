/* 快手直播 */
export interface PlayUrlItem {
  url: string;
  qualityType: 'STANDARD' | 'HIGH' | 'SUPER' | 'BLUE_RAY';
  name: '高清' | '超清' | '蓝光 4M' | '蓝光 8M';
}

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