import Live48Worker from 'worker-loader!./live48.worker';
import type { LiveStreamInfo } from './interface';

/**
 * 抓取网页地址
 * TODO: 48的网页会卡下次抓取，所以使用fetch来抓取
 * @param { string } uri: 网页地址
 */
export async function requestFetchHtml(uri: string): Promise<string> {
  const res: Response = await fetch(uri);

  return await res.text();
}

/**
 * 获取直播地址
 * @param { string } param
 * @param { string } video_id
 * @param { string } suid
 * @param { string } id
 */
export function requestStreamInfo(param: string, video_id: string, suid: string, id: string): Promise<LiveStreamInfo> {
  return new Promise((resolve: Function, reject: Function): void => {
    const worker: Worker = new Live48Worker();

    worker.addEventListener('message', function(event: MessageEvent<LiveStreamInfo>) {
      resolve(event.data);
      worker.terminate();
    }, false);

    worker.postMessage({ param, video_id, suid, id });
  });
}