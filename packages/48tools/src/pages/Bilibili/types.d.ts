/* ========== Download ========== */
export interface DownloadItem {
  qid: string;              // 当前的下载id，随机
  type: 'bv' | 'av' | 'au'; // 下载类型
  id: string;               // 视频：av、bv的id，音频：au的id
  page: number;             // 分页
  durl: string;             // 下载地址
  pic?: string;             // 封面图
  dash?: {
    video: string;
    audio: string;
  };
  title?: string;
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
  epInfo: {
    aid: number;
    cid: number;
  };
}

// 番剧__NEXT_DATA__的数据结构
export interface EpisodesItem {
  aid: number;
  bvid: string;
  cid: number;
  id: number;
  long_title: string;
}

export interface NextDataMediaInfo {
  media_id: number;  // ss id
  season_id: number; // ss id
  title: string;     // 标题
  episodes: Array<EpisodesItem>;
}

export interface NextData {
  props: {
    pageProps: {
      dehydratedState: {
        queries: [{
          state: {
            data: {
              seasonInfo: {
                mediaInfo: NextDataMediaInfo;
              };
            };
          };
        }];
      };
    };
  };
}

// 进度条信息
export interface ProgressEventData {
  percent: number;
  transferred: number;
  total: number;
}