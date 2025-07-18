import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
// @ts-expect-error
import got, { type Response as GotResponse } from 'got';
import type { WeiboImageItem } from '../../types';

interface WorkerEventData {
  filePath: string;
  asVideo: boolean;
  checkedList: Array<WeiboImageItem>;
}

/**
 * 下载文件
 * @param { string } fileUrl - 文件url地址
 * @param { string } filename - 文件本地地址
 */
async function requestDownloadFileByStream(fileUrl: string, filename: string): Promise<void> {
  const response: GotResponse<Buffer> = await got(fileUrl, {
    headers: {
      referer: 'https://weibo.com/'
    },
    responseType: 'buffer'
  });

  await fsPromises.writeFile(filename, response.body, 'binary');
}

/* 下载图片 */
addEventListener('message', async function(event: MessageEvent<WorkerEventData>): Promise<void> {
  const { filePath, checkedList }: WorkerEventData = event.data;
  const downloadList: Array<Promise<void>> = [];

  if (!fs.existsSync(filePath)) {
    await fsPromises.mkdir(filePath, { recursive: true });
  }

  for (const item of checkedList) {
    const fileUrl: string = item.infos.largest.url;
    const filename: string = path.join(filePath, `${ item.pid }${ path.extname(fileUrl) }`);

    downloadList.push(requestDownloadFileByStream(fileUrl, filename));

    // 额外下载视频
    if (item.infos.video) {
      // videoFileUrl: xxx.mov?Expires=xxxx
      const videoFileUrl: string = item.infos.video;
      let ext: string = path.extname(videoFileUrl);
      const queryIndex: number = ext.indexOf('?');

      if (queryIndex !== -1) {
        ext = ext.substring(0, queryIndex);
      }

      const videoFilename: string = path.join(filePath, `${ item.pid }${ ext }`);

      downloadList.push(requestDownloadFileByStream(videoFileUrl, videoFilename));
    }
  }

  await Promise.allSettled(downloadList);
  self.postMessage({});
});