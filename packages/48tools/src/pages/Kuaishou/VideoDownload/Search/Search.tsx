import { randomUUID } from 'node:crypto';
import { ipcRenderer, type IpcRendererEvent, type Cookie } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  useCallback,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type ChangeEvent
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Input, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { match, type Match, type MatchFunction } from 'path-to-regexp';
import { requestShortVideo, type ShortVideoDownloadResponse } from '@48tools-api/kuaishou';
import { KuaishouCookieChannel } from '@48tools/main/src/channelEnum';
import { kuaishouCookie } from '../function/kuaishouCookie';
import { setAddVideoDownloadList } from '../../reducers/kuaishouVideoDownload';

type VideoParam = Partial<{ videoId: string }>;
const kuaishouShortVideoUrlMatch: MatchFunction<VideoParam> = match('/short-video/:videoId');

/**
 * 根据ID或视频url搜索
 * 测试ID: 3xvpdvtefviwhkq
 */
function Search(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [urlLoading, setUrlLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 获取到视频地址，添加到下载列表
  const addUrlToVideoDownload: (res: ShortVideoDownloadResponse) => void
    = useCallback(function(res: ShortVideoDownloadResponse): void {
      if (res.data.visionVideoDetail.photo !== null) {
        dispatch(setAddVideoDownloadList({
          qid: randomUUID(),
          title: res.data.visionVideoDetail.photo.caption,
          url: res.data.visionVideoDetail.photo.manifest.adaptationSet[0].representation[0].url
        }));
      } else {
        messageApi.warning('没有获取到视频地址！');
      }

      setUrlLoading((): boolean => false);
    }, []);

  // 解析视频地址
  async function handleGetVideoInfoSearch(value: string, event: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (/^\s*$/.test(value)) return;

    // 验证是否为快手视频且提取url
    let videoId: string | undefined = undefined;
    let urlParse: URL | null = null;

    try {
      urlParse = new URL(value);

      if (!/www\.kuaishou\.com/.test(urlParse.hostname)) {
        messageApi.warning('请输入快手的视频地址！');

        return;
      }

      const matchResult: Match<VideoParam> = kuaishouShortVideoUrlMatch(urlParse.pathname);

      if (typeof matchResult === 'object') {
        videoId = matchResult.params.videoId;
      }
    } catch {
      videoId = value;
    }

    if (!videoId) return;

    setUrlLoading(true);

    // 获取视频地址（有可能会出现验证码）
    const res: ShortVideoDownloadResponse = await requestShortVideo(videoId, kuaishouCookie.cookie);

    // 出现验证码
    if (res.data.captcha || res.data.url) {
      ipcRenderer.send(KuaishouCookieChannel.KuaishouCookie, videoId);
    } else {
      addUrlToVideoDownload(res);
    }
  }

  // 监听cookie的返回
  const handleKuaishouCookieResponse: (event: IpcRendererEvent, cookie: Array<Cookie>, videoId: string) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookie: Array<Cookie>, videoId: string): Promise<void> {
      kuaishouCookie.cookie = cookie.filter((o: Cookie): boolean => o.name !== '')
        .map((o: Cookie): string => `${ o.name }=${ o.value }`).join('; ');

      const res: ShortVideoDownloadResponse = await requestShortVideo(videoId, kuaishouCookie.cookie);

      if (res.data.captcha || res.data.url) {
        messageApi.warning('获取快手Cookie失败，请重试！');
        setUrlLoading((): boolean => false);
      } else {
        addUrlToVideoDownload(res);
      }
    }, []);

  useEffect(function(): () => void {
    ipcRenderer.on(KuaishouCookieChannel.KuaiShouCookieResponse, handleKuaishouCookieResponse);

    return function(): void {
      ipcRenderer.off(KuaishouCookieChannel.KuaiShouCookieResponse, handleKuaishouCookieResponse);
    };
  }, []);

  return (
    <Fragment>
      <Input.Search className="!mr-[8px] !w-[350px]"
        enterButton="解析视频"
        placeholder="输入视频ID或视频地址"
        loading={ urlLoading }
        onSearch={ handleGetVideoInfoSearch }
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Search;