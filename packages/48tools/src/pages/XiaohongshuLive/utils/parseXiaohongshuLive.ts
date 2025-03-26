import type { InitialState } from '@48tools-api/xiaohongshu';

/**
 * 小红书直播解析
 * @param { string } html - 直播的html
 */
export function parseXiaohongshuLive(html: string): InitialState | undefined {
  const parseDocument: Document = new DOMParser().parseFromString(html, 'text/html');
  const scripts: HTMLCollectionOf<HTMLScriptElement> = parseDocument.getElementsByTagName('script');
  let initialState: InitialState | undefined = undefined;

  for (const script of scripts) {
    const scriptText: string = script.innerHTML;

    if (/window\.__INITIAL_STATE__/i.test(scriptText)) {
      // eslint-disable-next-line no-eval
      initialState = eval(`(${ scriptText.replace(/\s*window\.__INITIAL_STATE__\s*=\s*/i, '').replace(/;?\s*$/, '') })`);
    }
  }

  return initialState;
}