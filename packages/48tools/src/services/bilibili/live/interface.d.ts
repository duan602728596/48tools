/* ========== Live ========== */
// 直播间信息
export interface RoomInfo {
  code: number;
  msg: string;
  message: string;
  data: {
    room_id: number;
    short_id: number;
    uid: number;
    live_status: number;
    title: string;
    user_cover: string;
  };
}

// 直播间地址信息v2
export interface RoomPlayUrlV2StreamFormatCodec {
  codec_name: 'avc';
  current_qn: number;
  accept_qn: Array<number>; // 分辨率选项列表
  base_url: string;
  url_info: Array<{
    host: string;
    extra: string;
  }>;
}

export interface RoomPlayUrlV2StreamFormat {
  format_name: 'flv' | 'http_hls' | 'fmp4';
  codec: Array<RoomPlayUrlV2StreamFormatCodec>;
}

export interface RoomPlayUrlV2QnDesc {
  qn: number;
  desc: string;
}

export interface RoomPlayUrlV2 {
  code: number;
  message: string;
  data: {
    room_id: number;
    short_id: number;
    uid: number;
    live_status: number;
    playurl_info: {
      playurl: {
        stream: Array<{
          protocol_name: 'http_stream' | 'http_hls';
          format: Array<RoomPlayUrlV2StreamFormat>;
        }>;
        g_qn_desc: Array<RoomPlayUrlV2QnDesc>;
      };
    };
  };
}