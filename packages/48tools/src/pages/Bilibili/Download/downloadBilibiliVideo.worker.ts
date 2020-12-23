import { requestDownloadFileByStream } from '../services/download';
import type { ProgressEventData } from '../types';

type WorkerEventData = {
  type: 'start';
  filePath: string;
  durl: string;
  qid: string;
};

export type MessageEventData = {
  type: 'success' | 'progress';
  qid: string;
  data: number;
};

/**
 * 下载视频或者音频
 * @param { string } qid: qid
 * @param { string } durl: 文件的网络地址
 * @param { string } filePath: 保存位置
 */
function download(qid: string, durl: string, filePath: string): void {
  requestDownloadFileByStream(durl, filePath, function(e: ProgressEventData): void {
    if (e.percent >= 1) {
      // @ts-ignore
      postMessage({ type: 'success', qid });
    } else {
      // @ts-ignore
      postMessage({
        type: 'progress',
        data: Math.floor(e.percent * 100),
        qid
      });
    }
  });
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type, filePath, durl, qid }: WorkerEventData = event.data;

  if (type === 'start') {
    download(qid, durl, filePath);
  }
});