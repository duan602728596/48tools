export interface DownloadItem {
  qid: string;              // 当前的下载id，随机
  type: 'bv' | 'av' | 'au'; // 下载类型
  id: string;               // 视频：av、bv的id，音频：au的id
  page: number;             // 分页
  durl: string;             // 下载地址
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
}

// 接口请求到的视频信息
export interface VideoInfo {
  durl?: Array<{
    backup_url: string;
    url: string;
  }>;
  format: string;
}