import * as fs from 'node:fs';
import * as fsP from 'node:fs/promises';
import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import * as os from 'os';
import type { OpenDialogReturnValue } from 'electron';
import type { Browser, BrowserContext, Page, Route, Request, Response as PWResponse } from 'playwright-core';
import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, Selector } from 'reselect';
import { Button, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { FileSyncOutlined as IconFileSyncOutlined } from '@ant-design/icons';
import filenamify from 'filenamify/browser';
import { showOpenDialog } from '../../../../utils/remote/dialog';
import { errorNativeMessage } from '../../../../utils/remote/nativeMessage';
import { getBrowser, getExecutablePath } from '../../../../utils/utils';
import { setLocalMessageBrowser, type RoomMessageInitialState } from '../../reducers/roomMessage';

/**
 * 根据url返回文件名和文件夹完整路径
 * @param { URL } urlResult: url解析结果
 * @param { string } htmlStaticDir: 静态资源路径
 */
function getResFile(urlResult: URL, htmlStaticDir: string): [string, string] {
  const resFilename: string = filenamify(urlResult.pathname.replace(/\//g, '__')); // 文件
  const resFile: string = path.join(htmlStaticDir, resFilename); // 文件完整路径

  return [resFilename, resFile];
}

/**
 * 将src本地化
 * @param { string } htmlStaticDir: 完整的静态资源路径
 * @param { string } relativeStaticDir: 相对的静态资源路径
 * @param { NodeListOf<T extends HTMLImageElement | HTMLVideoElement | HTMLAudioElement> } doms: dom节点
 */
function replaceSrc<T extends HTMLImageElement | HTMLVideoElement | HTMLAudioElement>(
  htmlStaticDir: string,
  relativeStaticDir: string,
  doms: NodeListOf<T>
): void {
  for (const dom of doms) {
    const src: string | null = dom.getAttribute('src');

    if (src) {
      const urlResult: URL = new URL(src);
      const [resFilename, resFile]: [string, string] = getResFile(urlResult, htmlStaticDir);

      if (fs.existsSync(resFile)) {
        dom.setAttribute('src', `${ relativeStaticDir }/${ resFilename }`);
      }
    }
  }
}

/* redux selector */
type RSelector = Pick<RoomMessageInitialState, 'localMessageBrowser'>;
type RState = { roomMessage: RoomMessageInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  localMessageBrowser: ({ roomMessage }: RState): Browser | null => roomMessage.localMessageBrowser
});

/* 将文件本地化 */
function LocalMessage(props: {}): ReactElement {
  const { localMessageBrowser }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 点击选择一个文件夹，进行文件本地化处理
  async function handleLocalMessageClick(event: MouseEvent): Promise<void> {
    const executablePath: string | null = getExecutablePath();

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      errorNativeMessage('请先配置无头浏览器！');

      return;
    }

    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    let browser: Browser | null = null;

    try {
      const files: Array<string> = (await fsP.readdir(result.filePaths[0]))
        .filter((file: string): boolean => file.endsWith('.html'));

      if (files.length === 0) return;

      // 创建local目录
      const localPath: string = path.join(result.filePaths[0], 'local');

      if (!fs.existsSync(localPath)) {
        await fsP.mkdir(localPath);
      }

      // 创建无头浏览器实例
      browser = await getBrowser(executablePath).launch({
        headless: false,
        executablePath,
        timeout: 0
      });

      dispatch(setLocalMessageBrowser(browser));

      const context: BrowserContext = await browser.newContext();

      // 对每个文件的请求进行拦截，将静态资源保存到本地
      for (const file of files) {
        const htmlFile: string = path.join(result.filePaths[0], file); // 当前解析的文件名
        const htmlFilePath: ParsedPath = path.parse(htmlFile);         // 当前解析的文件路径
        const relativeStaticDir: string = `${ htmlFilePath.name }_static`;
        const htmlStaticDir: string = path.join(localPath, relativeStaticDir); // 当前解析的文件静态资源目录
        const page: Page = await context.newPage();

        // 拦截
        await page.route(/.*/, async function(route: Route, request: Request): Promise<void> {
          await route.continue();

          const url: string = request.url();
          const urlResult: URL = new URL(url);

          if (/48\.cn|netease\.im/.test(urlResult.hostname)) {
            const [resFilename, resFile]: [string, string] = getResFile(urlResult, htmlStaticDir);

            // 判断资源文件夹是否存在
            if (!fs.existsSync(htmlStaticDir)) {
              await fsP.mkdir(htmlStaticDir);
            }

            // 判断拦截的资源是否存在
            if (!fs.existsSync(resFile)) {
              const response: PWResponse | null = await request.response();

              if (response) {
                const status: number = response.status();

                if (status === 200) {
                  await fsP.writeFile(resFile, await response.body(), { encoding: null });
                } else if (status === 206) {
                  const res: Response = await fetch(url);

                  await fsP.writeFile(resFile, Buffer.from(await res.arrayBuffer()), { encoding: null });
                }
              }
            }
          }
        });

        // 处理资源
        await page.goto(`file://${ os.platform() === 'win32' ? '/' : '' }${ htmlFile }`, { timeout: 0 });
        await page.waitForLoadState('load', { timeout: 0 });
        await page.waitForTimeout(5_000);
        await page.close();

        // 对html进行处理
        const localHtmlPath: string = path.join(localPath, htmlFilePath.name + '.html');

        if (!fs.existsSync(localHtmlPath)) {
          const localHtmlDocument: Document = new DOMParser().parseFromString(
            await fsP.readFile(htmlFile, { encoding: 'utf-8' }), 'text/html');
          const ul: HTMLUListElement | null | undefined = localHtmlDocument.querySelector('html')
            ?.querySelector?.('.Box ul');

          if (ul) {
            const imgs: NodeListOf<HTMLImageElement> = ul.querySelectorAll('img'),
              videos: NodeListOf<HTMLVideoElement> = ul.querySelectorAll('video'),
              audios: NodeListOf<HTMLAudioElement> = ul.querySelectorAll('audio');

            replaceSrc<HTMLImageElement>(htmlStaticDir, relativeStaticDir, imgs);
            replaceSrc<HTMLVideoElement>(htmlStaticDir, relativeStaticDir, videos);
            replaceSrc<HTMLAudioElement>(htmlStaticDir, relativeStaticDir, audios);
            await fsP.writeFile(localHtmlPath, new XMLSerializer().serializeToString(localHtmlDocument), {
              encoding: 'utf-8'
            });
          }
        }
      }

      messageApi.success('文件本地化处理完毕！');
    } catch (err) {
      console.error(err);
      messageApi.error('文件本地化失败！');
    }

    dispatch(setLocalMessageBrowser(null));
    await browser?.close?.();
    browser = null;
  }

  // 停止本地化
  async function handleCloseLocalMessageClick(event: MouseEvent): Promise<void> {
    try {
      await localMessageBrowser?.close?.();
    } catch (err) {
      console.error(err);
    }

    dispatch(setLocalMessageBrowser(null));
  }

  return (
    <Fragment>
      {
        localMessageBrowser ? (
          <Button className="mr-[8px]"
            type="primary"
            icon={ <IconFileSyncOutlined /> }
            danger={ true }
            block={ true }
            ghost={ true }
            onClick={ handleCloseLocalMessageClick }
          >
            停止HTML本地化
          </Button>
        ) : (
          <Button className="mr-[8px]" icon={ <IconFileSyncOutlined /> } block={ true } onClick={ handleLocalMessageClick }>
            HTML本地化
          </Button>
        )
      }
      { messageContextHolder }
    </Fragment>
  );
}

export default LocalMessage;