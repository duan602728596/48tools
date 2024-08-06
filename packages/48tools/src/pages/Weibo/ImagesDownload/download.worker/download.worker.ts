import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
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
  const { filePath, asVideo, checkedList }: WorkerEventData = event.data;
  const downloadList: Array<Promise<void>> = [];

  for (const item of checkedList) {
    let fileUrl: string = item.infos.largest.url;

    if (item.infos.video && asVideo) {
      fileUrl = item.infos.video;
    }

    const filename: string = path.join(filePath, `${ item.pid }${ path.extname(fileUrl) }`);

    downloadList.push(requestDownloadFileByStream(fileUrl, filename));
  }

  if (!fs.existsSync(filePath)) {
    await fsPromises.mkdir(filePath, { recursive: true });
  }

  await Promise.allSettled(downloadList);
  self.postMessage({});
});