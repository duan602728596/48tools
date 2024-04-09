export interface PcLiveJson {
  code: number;
  msg: string;
  error_code: number;
  data: {
    liveId: string;
    status: 1 | 3 | number; // 1: 直播中, 3: 直播结束
    cover: string;
    title: string;
    user: {
      uid: number;
      screenName: string;
    };
    live_origin_hls_url: string;
    live_origin_flv_url: string;
    replay_origin_url: string;
  };
}