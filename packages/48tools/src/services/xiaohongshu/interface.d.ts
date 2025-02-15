export interface PullConfigStreamInfo {
  master_url: string;
  quality_type: 'HD';
  quality_type_name: '原画';
}

export interface PullConfig {
  width: number;
  height: number;
  h265: [];
  h264: Array<PullConfigStreamInfo>;
}

export interface InitialState {
  liveStream: {
    liveStatus: 'end' | 'success'; // 直播状态
    roomData: {
      roomInfo: {
        roomId: string;
        roomTitle: string;
        pullConfig: `{${ string }`;
      };
    };
  };
}