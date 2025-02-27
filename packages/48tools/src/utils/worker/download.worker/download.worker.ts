import { pipeline } from 'node:stream/promises';
import * as fs from 'node:fs';
import * as fsP from 'node:fs/promises';
// @ts-expect-error
import got, { type Headers, type Response as GotResponse } from 'got';
import type { ProgressEventData } from '../../../pages/Bilibili/types';

type WorkerEventData = {
  type: 'start';
  filePath: string;
  durl: string;
  qid: string;
  headers?: Headers;
  resStatus302?: boolean; // 302响应的处理
};

export type MessageEventData = {
  type: 'success' | 'progress';
  qid: string;
  data: number;
};

/**
 * 下载文件
 * @param { string } fileUrl - 文件url地址
 * @param { string } filename - 文件本地地址
 * @param { Headers | undefined } headers - 文件本地地址
 * @param { (e: ProgressEventData) => void } onProgress - 进度条
 */
async function requestDownloadFileByStream(
  fileUrl: string,
  filename: string,
  headers: Headers | undefined,
  onProgress: (e: ProgressEventData) => void
): Promise<void> {
  await pipeline(
    got.stream(fileUrl, {
      headers: headers ?? {
        referer: 'https://www.bilibili.com/'
      }
    }).on('downloadProgress', onProgress),
    fs.createWriteStream(filename)
  );
}

async function requestDownloadFile302MovedTemporarily(
  fileUrl: string,
  filename: string,
  headers: Headers | undefined,
  onProgress: (e: ProgressEventData) => void,
  endCallBack: () => void
): Promise<void> {
  const res: GotResponse<Buffer> = await got.get(fileUrl, {
    responseType: 'buffer',
    headers
  }).on('downloadProgress', onProgress);
  let body: Buffer;

  if ((res.statusCode === 302 || res.statusCode === 301) && res.headers.location) {
    const res2: GotResponse<Buffer> = await got.get(res.headers.location, {
      responseType: 'buffer',
      headers
    }).on('downloadProgress', onProgress);

    body = res2.body;
  } else {
    body = res.body;
  }

  await fsP.writeFile(filename, body, { encoding: null });
  endCallBack();
}

/**
 * 下载视频或者音频
 * @param { string } qid - qid
 * @param { string } durl - 文件的网络地址
 * @param { string } filePath - 保存位置
 * @param { boolean } [resStatus302] - 请求类型
 * @param { Headers } headers - 重新定义headers
 */
function download(qid: string, durl: string, filePath: string, resStatus302?: boolean, headers?: Headers): void {
  if (resStatus302) {
    requestDownloadFile302MovedTemporarily(durl, filePath, headers, function(e: ProgressEventData): void {
      if (e.percent < 1) {
        postMessage({
          type: 'progress',
          data: Math.floor(e.percent * 100),
          qid
        });
      }
    }, function() {
      postMessage({ type: 'success', qid });
    });
  } else {
    requestDownloadFileByStream(durl, filePath, headers, function(e: ProgressEventData): void {
      if (e.percent >= 1) {
        postMessage({ type: 'success', qid });
      } else {
        postMessage({
          type: 'progress',
          data: Math.floor(e.percent * 100),
          qid
        });
      }
    });
  }
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type, filePath, durl, qid, headers, resStatus302 }: WorkerEventData = event.data;

  if (type === 'start') {
    download(qid, durl, filePath, resStatus302, headers);
  }
});