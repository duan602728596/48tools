import { requestLiveHtml } from '@48tools-api/kuaishou';
import type { LiveInfo, KuaishouLiveInitialState, PlayListItem } from '../../types';

function evalFunction(objectString: string): Function {
  // eslint-disable-next-line no-new-func
  return new Function(`'use strict';
return (${ objectString })`);
}

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

      initialState = evalFunction(str)();
      break;
    }
  }

  return initialState;
}

/* 获取直播间的相关信息 */
async function getLiveInfo(id: string): Promise<LiveInfo | undefined> {
  const res: string = await requestLiveHtml(id);
  const initialState: KuaishouLiveInitialState | undefined = parseHtml(res);

  if (!initialState) return;

  const playListItem: PlayListItem | undefined = initialState?.liveroom?.playList?.[0];

  if (!playListItem) return;

  if (playListItem?.liveStream?.playUrls?.[0]?.adaptationSet?.representation?.length) {
    return {
      title: playListItem.liveStream.caption,
      list: playListItem.liveStream.playUrls[0].adaptationSet.representation
    };
  }
}

export default getLiveInfo;