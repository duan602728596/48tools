import { requestLiveHtml } from '../../services/live';
import type { KuaishouLiveInitialState, PlayUrlItem } from '../../types';

/**
 * 解析initialState
 * @param { string } html
 */
function parseHtml(html: string): KuaishouLiveInitialState | undefined {
  const parseDocument: Document = new DOMParser().parseFromString(html, 'text/html');
  const scripts: NodeListOf<HTMLScriptElement> = parseDocument.querySelectorAll('script');
  let initialState: KuaishouLiveInitialState | undefined = undefined;

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

export interface LiveInfo {
  title: string;
  list: Array<PlayUrlItem>;
}

/* 获取直播间的相关信息 */
async function getLiveInfo(id: string): Promise<LiveInfo | undefined> {
  const res: string = await requestLiveHtml(id);
  const initialState: KuaishouLiveInitialState | undefined = parseHtml(res);

  if (initialState?.liveroom?.liveStream?.playUrls?.[0]?.adaptationSet?.representation?.length) {
    return {
      title: initialState.liveroom.liveStream.caption,
      list: initialState.liveroom.liveStream.playUrls[0].adaptationSet.representation
    };
  }
}

export default getLiveInfo;