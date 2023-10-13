import { protocol, type Protocol } from 'electron';
import { playUrlLogTemplate } from './logTemplate/bilibiliLive.mjs';
import { utilLogTemplate } from './logTemplate/ffmpeg.mjs';

/* template方法 */
const template: Record<string, Record<string, (t: string, fn: string, d: string) => string>> = {
  bilibililive: {
    playurl: playUrlLogTemplate
  },
  ffmpeg: {
    util: utilLogTemplate,
    mainThread: utilLogTemplate
  }
};

protocol.registerSchemesAsPrivileged([{
  scheme: 'log',
  privileges: {
    bypassCSP: true,
    corsEnabled: true,
    supportFetchAPI: true
  }
}]);

/* log协议的处理 */
async function protocolHandleCallback(request: Request): Promise<Response> {
  // 解析params
  const urlResult: URL = new URL(request.url);
  const type: string | null = urlResult.searchParams.get('type'); // 类型
  const fn: string | null = urlResult.searchParams.get('fn');     // 执行的方法
  const data: string | undefined = await request.text();          // 数据

  if (!(type && fn && data)) {
    return new Response(undefined, { status: 404 });
  }

  // 生成日志
  let resData: string | null = null;

  if (template?.[type]?.[fn]) {
    resData = template[type][fn](type, fn, data);
  }

  if (resData) {
    return new Response(resData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf8'
      }
    });
  } else {
    return new Response(undefined, { status: 404 });
  }
}

/* 创建协议，拦截日志 */
function logProtocol(): void {
  const { handle, isProtocolHandled }: Protocol = protocol;

  if (!isProtocolHandled('log')) {
    handle('log', protocolHandleCallback);
  }
}

export default logProtocol;