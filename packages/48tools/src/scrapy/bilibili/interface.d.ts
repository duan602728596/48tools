// 视频列表的详细信息
export interface BilibiliVideoInfoItem {
  videoUrl: string;
  audioUrl?: string;
  quality: number; // 分辨率
}

// 解析的视频列表
export interface BilibiliVideoResultItem {
  title: string; // 副标题
  cover: string; // 封面
  avid: string;
  bid: string;
  cid: string;
  videoInfo: Array<BilibiliVideoInfoItem>;
}