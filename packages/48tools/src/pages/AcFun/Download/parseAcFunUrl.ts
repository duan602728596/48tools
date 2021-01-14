import { JSDOM, DOMWindow } from 'jsdom';
import { requestAcFunHtml } from '../services/download';
import type { KsPlayJson, PageInfo, Representation } from '../types';

/**
 * 解析window.pageInfo
 * @param { string } html
 */
function getWindowPageInfo(html: string): PageInfo | undefined {
  const dom: JSDOM = new JSDOM(html);
  const { document }: DOMWindow = dom.window;
  const scripts: NodeListOf<HTMLScriptElement> = document.querySelectorAll('script');
  let pageInfo: PageInfo | undefined = undefined;

  for (const script of scripts) {
    const data: string = script.innerHTML;

    if (/window\.pageInfo\s*=\s*/i.test(data)) {
      const dataArr: string[] = data.split(/\n/)
        .filter((o: string): boolean => /window\.pageInfo\s*=\s*/i.test(o));
      const pageInfoStr: string = dataArr[0]
        .replace(/^\s*window\.[a-zA-Z]+\s*=\s*window\.[a-zA-Z]+\s*=\s*/i, '')
        .replace(/;\s*$/, '');

      pageInfo = JSON.parse(pageInfoStr);
      break;
    }
  }

  return pageInfo;
}

/**
 * 解析acfun视频地址
 * @param { string } type: 视频类型
 * @param { string } id: 视频id
 */
export async function parseAcFunUrl(type: string, id: string): Promise<Array<Representation> | undefined> {
  const uri: string = `https://www.acfun.cn/${ type === 'aa' ? 'bangumi' : 'v' }/${ type }${ id }`;
  const res: string = await requestAcFunHtml(uri);
  const pageInfo: PageInfo | undefined = getWindowPageInfo(res);

  if (pageInfo) {
    const ksPlayJson: KsPlayJson = JSON.parse(pageInfo.currentVideoInfo.ksPlayJson);

    return ksPlayJson?.adaptationSet?.[0]?.representation;
  }

  return undefined;
}