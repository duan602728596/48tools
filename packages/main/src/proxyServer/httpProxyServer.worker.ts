import * as https from 'node:https';
import * as http from 'node:http';
import type { Server, IncomingMessage, ServerResponse } from 'node:http';
import { workerData } from 'node:worker_threads';

const baseUrl: string = `http://localhost:${ workerData.port }`;

/* 开启代理服务，加载ts文件 */
const server: Server = http.createServer(function(req: IncomingMessage, res: ServerResponse): void {
  if (!req.url) return;

  const urlParse: URL = new URL(req.url, baseUrl);

  if (urlParse.pathname !== '/proxy/ts48' ) return;

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
    res.setHeader('Content-type', 'video/mp2ts');
    response.pipe(res);
  });
});

server.listen(workerData.port);