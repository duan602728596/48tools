import * as querystring from 'node:querystring';
import { rStr } from './utils';

/**
 * 使用jsonp请求接口
 * @param { string } uri: 请求的地址
 * @param { object } options: 请求参数
 */
function jsonp<T = any>(uri: string, options?: { [key: string]: any }): Promise<T> {
  return new Promise((resolve: Function, reject: Function): void => {
    const callbackName: string = `__$jsonpCallback_${ rStr(10) }__`;
    const qs: string = querystring.stringify(
      Object.assign({
        callback: callbackName
      }, options)
    );
    let script: HTMLScriptElement | null = document.createElement('script');

    globalThis[callbackName] = (data: T): void => {
      resolve(data);
      delete globalThis[callbackName];
      document.body.removeChild(script!);
      script = null;
    };

    script.src = `${ uri }?${ qs }`;
    document.body.appendChild(script);
  });
}

export default jsonp;