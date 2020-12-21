// 接口请求到的视频信息
export interface VideoInfo {
  durl?: Array<{
    backup_url: string;
    url: string;
  }>;
  format: string;
}

// 接口请求到的音频信息
export interface AudioInfo {
  code: number;
  data: {
    cdns?: Array<string>;
  };
  message: string;
}