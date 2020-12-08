import { JSDOM, DOMWindow } from 'jsdom';
import { requestBilibiliHtml } from '../services/download';

/**
 * 解析initialState
 * @param { string } html
 */
function parseInitialState(html: string): any {
  const dom: JSDOM = new JSDOM(html);
  const { document }: DOMWindow = dom.window;
  const scripts: NodeListOf<HTMLScriptElement> = document.querySelectorAll('script');
  let initialState: any = null;

  for (const script of scripts) {
    const scriptStr: string = script.innerHTML;

    if (/^window\._{2}INITIAL_STATE_{2}\s*=\s*.+$/.test(scriptStr)) {
      const str: string = scriptStr
        .replace(/window\._{2}INITIAL_STATE_{2}\s*=\s*/, '') // 剔除"="前面的字符串
        .replace(/;\(function\(\){var s;.+$/i, '');          // 剔除后面可能存在的函数

      initialState = JSON.parse(str);
      break;
    }
  }

  return initialState;
}

/**
 * 解析视频url
 * @param { string } type: 视频类型
 * @param { string } id: 视频id
 * @param { number } page: 分页
 */
export async function parseVideoUrl(type: string, id: string, page: number): Promise<void> {
  const videoUrl: string = `https://www.bilibili.com/video/${ type === 'av' ? 'av' : 'BV' }${ id }?p=${ page }`;
  const html: string = await requestBilibiliHtml(videoUrl);
  const initialState: any = parseInitialState(html);

  if (initialState === null) {
    return undefined;
  }
}