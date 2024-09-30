import { ipcRenderer, type IpcRendererEvent, type Cookie } from 'electron';
import { useEffect, useCallback } from 'react';
import { KuaishouCookieChannel } from '@48tools/main/src/channelEnum';
import { kuaishouCookie } from './function/kuaishouCookie';

interface UseKuaishouLoginProps {
  callback?(cookie: string, videoId: string): Promise<void> | void;
}

export interface UseKuaishouLoginReturn {
  handleOpenKuaishouLoginWin(videoId: string): Promise<void> | void;
}

/* 快手登录 */
function useKuaishouLogin(props: UseKuaishouLoginProps): UseKuaishouLoginReturn {
  const { callback }: UseKuaishouLoginProps = props;

  /**
   * 发送信号，打开快手登录窗口
   * @param { string } videoId - 视频ID
   */
  function handleOpenKuaishouLoginWin(videoId: string): void {
    ipcRenderer.send(KuaishouCookieChannel.KuaishouCookie, videoId);
  }

  // 监听cookie的返回
  const handleKuaishouCookieResponse: (event: IpcRendererEvent, cookie: Array<Cookie>, videoId: string) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookie: Array<Cookie>, videoId: string): Promise<void> {
      const cookieStr: string = cookie.filter((o: Cookie): boolean => o.name !== '')
        .map((o: Cookie): string => `${ o.name }=${ o.value }`).join('; ');

      kuaishouCookie.cookie = cookieStr;
      callback && (await callback(cookieStr, videoId));
    }, []);

  useEffect(function(): () => void {
    ipcRenderer.on(KuaishouCookieChannel.KuaiShouCookieResponse, handleKuaishouCookieResponse);

    return function(): void {
      ipcRenderer.off(KuaishouCookieChannel.KuaiShouCookieResponse, handleKuaishouCookieResponse);
    };
  }, [callback]);

  return { handleOpenKuaishouLoginWin };
}

export default useKuaishouLogin;