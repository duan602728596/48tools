type noProtocolUrl = `//${ string }`;

export interface AwemeDetail {
  desc: string; // 标题
  download: {
    prevent: boolean;
    url: string; // 有水印
  };
  video: {
    bitRateList: Array<{
      playApi: noProtocolUrl;
      playAddr: Array<{
        src: noProtocolUrl;
      }>;
    }>;
    playAddr: Array<{
      src: noProtocolUrl;
    }>;
    playApi: noProtocolUrl; // 无水印
  };
}

export interface C0Obj {
  odin: object;
  user: object;
}

export interface CVersionObj {
  aweme: {
    detail: AwemeDetail;
  };
}

export interface ScriptRendedData {
  _location: string;
  C_0: C0Obj;
  [key: string]: CVersionObj;
}

export interface DownloadUrlItem {
  value: string;
  label: string;
}

/* 下载相关 */
export interface DownloadItem {
  qid: string;   // 当前的下载id，随机
  url: string;   // 下载地址
  title: string; // 视频标题
}

// 进度条信息
export interface ProgressEventData {
  percent: number;
  transferred: number;
  total: number;
}