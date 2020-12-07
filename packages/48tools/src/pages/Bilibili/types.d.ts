export interface DownloadItem {
  id: string;               // 当前的下载id，随机
  type: 'bv' | 'av' | 'au'; // 下载类型
  bid: string;              // 视频：av、bv的id，音频：au的id
  durl: string;             // 下载地址
}