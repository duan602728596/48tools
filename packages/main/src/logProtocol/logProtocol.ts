import { protocol, type Protocol, type ProtocolRequest, type ProtocolResponse } from 'electron';

protocol.registerSchemesAsPrivileged([{
  scheme: 'log',
  privileges: {
    bypassCSP: true,
    corsEnabled: true,
    supportFetchAPI: true
  }
}]);

/* 创建协议，拦截日志 */
function logProtocol(): void {
  const { isProtocolRegistered, registerStringProtocol }: Protocol = protocol;

  if (!isProtocolRegistered('log')) {
    registerStringProtocol(
      'log',
      function(request: ProtocolRequest, callback: (response: ProtocolResponse) => void): void {
        const urlResult: URL = new URL(request.url);
        const data: string | undefined = request?.uploadData?.[0]?.bytes.toString();
        const json: Record<string, unknown> = data ? JSON.parse(data) : {};

        callback({
          statusCode: 200,
          mimeType: 'text/plain',
          data: ''
        });
      });
  }
}

export default logProtocol;