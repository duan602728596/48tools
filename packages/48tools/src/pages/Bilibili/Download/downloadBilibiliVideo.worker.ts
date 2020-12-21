import { requestDownloadFileByStream } from '../services/download';
import type { ProgressEventData } from '../types';

type EventData = {
  type: 'start';
  filePath: string;
  durl: string;
  qid: string;
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

addEventListener('message', function(event: MessageEvent<EventData>): void {
  const { type, filePath, durl, qid }: EventData = event.data;

  if (type === 'start') {
    download(qid, durl, filePath);
  }
});