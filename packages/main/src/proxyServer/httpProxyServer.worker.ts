import * as https from 'node:https';
import * as http from 'node:http';
import type { Server, IncomingMessage, ServerResponse } from 'node:http';
import { workerData } from 'node:worker_threads';

const baseUrl: string = `http://localhost:${ workerData.port }`;

/**
 * 官网公演录播的ts的下载
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
function ts48(urlParse: URL, httpResponse: ServerResponse): void {
  const tsUrl: string | null = urlParse.searchParams.get('url');

  if (!tsUrl) return;

  const deTsUrl: string = decodeURIComponent(tsUrl);
  const deTsUrlParse: URL = new URL(deTsUrl);

  (deTsUrlParse.protocol === 'https:' ? https : http).get(deTsUrl, {
    headers: {
      Host: 'ts.48.cn',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)'
        + ' Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.62'
    }
  }, function(response: IncomingMessage): void {
    httpResponse.setHeader('Content-type', 'video/mp2ts');
    response.pipe(httpResponse);
  });
}

/**
 * 口袋48录播的ts的下载
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
function cychengyuanVod48(urlParse: URL, httpResponse: ServerResponse): void {
  const tsUrl: string | null = urlParse.searchParams.get('url');

  if (!tsUrl) return;

  const deTsUrl: string = decodeURIComponent(tsUrl);
  const deTsUrlParse: URL = new URL(deTsUrl);

  (deTsUrlParse.protocol === 'https:' ? https : http).get(deTsUrl, {
    headers: {
      Host: 'cychengyuan-vod.48.cn',
      'User-Agent': 'SNH48 ENGINE'
    }
  }, function(response: IncomingMessage): void {
    httpResponse.setHeader('Content-type', 'video/mp2ts');
    response.pipe(httpResponse);
  });
}

/* 开启代理服务，加载ts文件 */
const server: Server = http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) return;

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/proxy/ts48' ) {
    ts48(urlParse, httpResponse);
  } else if (urlParse.pathname === '/proxy/cychengyuan-vod48' ) {
    cychengyuanVod48(urlParse, httpResponse);
  }
});

server.listen(workerData.port);