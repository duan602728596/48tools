import { protocol, type Protocol, type ProtocolRequest, type ProtocolResponse } from 'electron';
import { playUrlLogTemplate } from './logTemplate/bilibiliLive';
import { utilLogTemplate } from './logTemplate/ffmpeg';

/* template方法 */
const template: Record<string, Record<string, (t: string, fn: string, d: string) => string>> = {
  bilibililive: {
    playurl: playUrlLogTemplate
  },
  ffmpeg: {
    util: utilLogTemplate
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
function registerStringProtocolCallback(request: ProtocolRequest, callback: (response: ProtocolResponse) => void): void {
  // 解析params
  const urlResult: URL = new URL(request.url);
  const type: string | null = urlResult.searchParams.get('type'); // 类型
  const fn: string | null = urlResult.searchParams.get('fn');     // 执行的方法
  const data: string | undefined = request?.uploadData?.[0]?.bytes.toString();

  if (!(type && fn && data)) {
    callback({ statusCode: 404 });

    return;
  }

  // 生成日志
  let resData: string | null = null;

  if (template?.[type]?.[fn]) {
    resData = template[type][fn](type, fn, data);
  }

  if (resData) {
    callback({ statusCode: 200, data: resData, mimeType: 'text/plain; charset=utf8' });
  } else {
    callback({ statusCode: 204 });
  }
}

/* 创建协议，拦截日志 */
function logProtocol(): void {
  const { isProtocolRegistered, registerStringProtocol }: Protocol = protocol;

  if (!isProtocolRegistered('log')) {
    registerStringProtocol('log', registerStringProtocolCallback);
  }
}

export default logProtocol;