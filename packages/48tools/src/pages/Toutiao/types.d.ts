type noProtocolUrl = `//${ string }`;

export interface AwemeDetail {
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

export interface ScriptRendedData {
  _location: string;
  C_0: {
    odin: object;
    user: object;
  };
  C_12: {
    aweme: {
      detail: AwemeDetail;
    };
  };
}

export interface DownloadUrlItem {
  value: string;
  label: string;
}

/* 下载相关 */
export interface DownloadItem {
  qid: string;  // 当前的下载id，随机
  url: string;  // 下载地址
  path: string; // 下载位置
}

// 进度条信息
export interface ProgressEventData {
  percent: number;
  transferred: number;
  total: number;
}