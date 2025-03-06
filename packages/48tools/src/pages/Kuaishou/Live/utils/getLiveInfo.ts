import { requestLiveHtml } from '@48tools-api/kuaishou';
import { kuaishouCookie } from '../../../../functionalComponents/KuaishouLogin/function/kuaishouCookie';
import type { LiveInfo, ErrorInfo, KuaishouLiveInitialState, PlayUrl, PlayListItem } from '../../types';

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
async function getLiveInfo(id: string): Promise<LiveInfo | ErrorInfo | undefined> {
  const res: string = await requestLiveHtml(id, kuaishouCookie.cookie);
  const initialState: KuaishouLiveInitialState | undefined = parseHtml(res);

  if (!initialState) return;

  if (initialState?.liveroom?.playList?.[0]?.errorType) {
    return {
      error: initialState.liveroom.playList[0].errorType.title
    };
  }

  const playListItem: PlayListItem | undefined = initialState?.liveroom?.playList?.[0];

  if (!playListItem) return;

  const playUrl: PlayUrl = playListItem?.liveStream?.playUrls?.h264 ?? playListItem?.liveStream?.playUrls?.hevc;

  if (playUrl?.adaptationSet?.representation?.length) {
    return {
      title: playListItem.liveStream.caption,
      list: playUrl.adaptationSet.representation
    };
  }
}

export default getLiveInfo;