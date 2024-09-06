import { promisify } from 'node:util';
import * as https from 'node:https';
import * as http from 'node:http';
import type { ClientRequest, IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'node:http';
import { workerData } from 'node:worker_threads';
import { brotliDecompress } from 'node:zlib';
import * as fs from 'node:fs';
import * as fsPromise from 'node:fs/promises';
import * as path from 'node:path';

const brotliDecompressPromise: (buffer: Buffer) => Promise<Buffer> = promisify(brotliDecompress);

const baseUrl: string = `http://localhost:${ workerData.port }`;
const maxAge: number = 7 * 24 * 60 * 60;
const pcUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)'
  + ' Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.62';

function response404NotFound(httpResponse: ServerResponse): void {
  httpResponse.statusCode = 404;
  httpResponse.end('404 not found.');
}

/**
 * bilibili视频代理
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
function bilibiliResponseHandle(urlParse: URL, httpResponse: ServerResponse): void {
  const bilibiliUrl: string | null = urlParse.searchParams.get('url');

  if (!bilibiliUrl) return response404NotFound(httpResponse);

  const deBilibiliUrl: string = decodeURIComponent(bilibiliUrl);
  const deBilibiliUrlParse: URL = new URL(deBilibiliUrl);

  const req: ClientRequest = (deBilibiliUrlParse.protocol === 'https:' ? https : http)
    .get(deBilibiliUrl, {
      headers: {
        Referer: 'https://www.bilibili.com/',
        'User-Agent': pcUserAgent
      }
    }, function(response: IncomingMessage): void {
      response.pipe(httpResponse);
      response.on('error', function(error: Error): void {
        console.error(`[Http response pipe error] ${ deBilibiliUrl }\n`, error, '\n');
      });
    });

  req.on('error', function(error: Error): void {
    httpResponse.statusCode = 400;
    httpResponse.end(null);
    console.error(`[Http request error] ${ deBilibiliUrl }\n`, error, '\n');
  });
}

/**
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 * @param { OutgoingHttpHeaders } headers
 */
function tsResponseHandle(urlParse: URL, httpResponse: ServerResponse, headers: OutgoingHttpHeaders): void {
  const tsUrl: string | null = urlParse.searchParams.get('url');

  if (!tsUrl) return response404NotFound(httpResponse);

  const deTsUrl: string = decodeURIComponent(tsUrl);
  const deTsUrlParse: URL = new URL(deTsUrl);

  const req: ClientRequest = (deTsUrlParse.protocol === 'https:' ? https : http)
    .get(deTsUrl, { headers, timeout: 10_000 }, function(response: IncomingMessage): void {
      const buffer: Array<Buffer> = [];

      response.on('data', (chunk: Buffer): unknown => buffer.push(chunk));

      response.on('end', (): void => {
        httpResponse.setHeader('Content-type', 'video/mp2ts');
        httpResponse.setHeader('Cache-Control', `max-age=${ maxAge }`);
        httpResponse.end(Buffer.concat(buffer));
      });

      response.on('error', (error: Error): void => {
        httpResponse.statusCode = response.statusCode ?? 400;
        httpResponse.end(null);
        console.error(`[Http response error] ${ deTsUrl }\n`, error, '\n');
      });
    });

  req.on('error', function(error: Error): void {
    httpResponse.statusCode = 400;
    httpResponse.end(null);
    console.error(`[Http request error] ${ deTsUrl }\n`, error, '\n');
  });
}

/**
 * 响应并解压缩sourcemap
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
async function sourceMapResponseHandle(urlParse: URL, httpResponse: ServerResponse): Promise<void> {
  const sourcemapFilename: string | undefined = urlParse.pathname.split(/[\\/]/g).at(-1);

  if (!sourcemapFilename) return response404NotFound(httpResponse);

  const sourcemapFile: string = path.join(workerData.sourcemap, `${ sourcemapFilename }.br`);

  if (!fs.existsSync(sourcemapFile)) return response404NotFound(httpResponse);

  const buffer: Buffer = await fsPromise.readFile(sourcemapFile, { encoding: null });

  httpResponse.setHeader('Content-type', 'application/jsonmap');
  httpResponse.end(await brotliDecompressPromise(buffer));
}

/* 开启代理服务，加载ts文件 */
http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) {
    return response404NotFound(httpResponse);
  }

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/proxy/ts48' ) {
    // 官网公演录播的ts的下载
    tsResponseHandle(urlParse, httpResponse, {
      Host: 'ts.48.cn',
      'User-Agent': pcUserAgent
    });
  } else if (urlParse.pathname === '/proxy/cychengyuan-vod48') {
    // 口袋48录播的ts的下载
    tsResponseHandle(urlParse, httpResponse, {
      Host: 'cychengyuan-vod.48.cn',
      'User-Agent': 'SNH48 ENGINE'
    });
  } else if (urlParse.pathname === '/proxy/bilibili-video') {
    bilibiliResponseHandle(urlParse, httpResponse);
  } else if (/^\/proxy\/s1\/.+\.map$/i.test(urlParse.pathname)) {
    sourceMapResponseHandle(urlParse, httpResponse);
  } else {
    response404NotFound(httpResponse);
  }
}).listen(workerData.port);