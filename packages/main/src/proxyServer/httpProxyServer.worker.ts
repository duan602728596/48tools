import * as https from 'node:https';
import * as http from 'node:http';
import type { ClientRequest, IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'node:http';
import { workerData } from 'node:worker_threads';

const baseUrl: string = `http://localhost:${ workerData.port }`;

/**
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 * @param { OutgoingHttpHeaders } headers
 */
function tsResponseHandle(urlParse: URL, httpResponse: ServerResponse, headers: OutgoingHttpHeaders): void {
  const tsUrl: string | null = urlParse.searchParams.get('url');

  if (!tsUrl) return;

  const deTsUrl: string = decodeURIComponent(tsUrl);
  const deTsUrlParse: URL = new URL(deTsUrl);

  const req: ClientRequest = (deTsUrlParse.protocol === 'https:' ? https : http)
    .get(deTsUrl, { headers }, function(response: IncomingMessage): void {
      const buffer: Array<Buffer> = [];

      response.on('data', (chunk: Buffer): unknown => buffer.push(chunk));

      response.on('end', (): void => {
        httpResponse.setHeader('Content-type', 'video/mp2ts');
        httpResponse.end(Buffer.concat(buffer));
      });

      response.on('error', (error: Error): unknown => console.error(error));
    });

  req.on('error', function(error: Error): void {
    httpResponse.statusCode = 400;
    httpResponse.end(null);
    console.error(error);
  });
}

/* 开启代理服务，加载ts文件 */
http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) return;

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/proxy/ts48' ) {
    // 官网公演录播的ts的下载
    tsResponseHandle(urlParse, httpResponse, {
      Host: 'ts.48.cn',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)'
        + ' Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.62'
    });
  } else if (urlParse.pathname === '/proxy/cychengyuan-vod48' ) {
    // 口袋48录播的ts的下载
    tsResponseHandle(urlParse, httpResponse, {
      Host: 'cychengyuan-vod.48.cn',
      'User-Agent': 'SNH48 ENGINE'
    });
  }
}).listen(workerData.port);