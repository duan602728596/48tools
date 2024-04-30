import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import * as fs from 'node:fs';
import { promises as fsP } from 'node:fs';
import type { SaveDialogReturnValue, OpenDialogReturnValue } from 'electron';
import { Fragment, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { message, Button, Image } from 'antd';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { CloudDownloadOutlined as IconCloudDownloadOutlined } from '@ant-design/icons';
import { requestDownloadFileByStream, type LiveInfo } from '@48tools-api/48';
import style from './downloadImages.sass';
import { showOpenDialog, showSaveDialog } from '../../../../../utils/remote/dialog';
import ImagePreview from './ImagePreview';
import { source } from '../../../../../utils/snh48';

interface DownloadImagesProps {
  liveInfo: LiveInfo;
  coverPath: string;
  carousels?: Array<string>;
}

/* 图片下载 */
function DownloadImages(props: DownloadImagesProps): ReactElement {
  const { liveInfo, coverPath, carousels }: DownloadImagesProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 下载图片
  async function handleDownloadClick(event: MouseEvent<HTMLAnchorElement>): Promise<void> {
    event.preventDefault();

    try {
      const href: string = event.target['getAttribute']('href');
      const pathResult: ParsedPath = path.parse(href);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[口袋48图片]${ liveInfo.userInfo.nickname }_${ liveInfo.title }_${ pathResult.base }`
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(source(href), result.filePath);
      messageApi.success('图片下载完成！');
    } catch (err) {
      console.error(err);
      console.error('图片下载失败！');
    }
  }

  // 渲染其他图片
  function carouselsRender(): Array<ReactNode> | null {
    if (carousels?.length) {
      return carousels.map((item: string, index: number): ReactElement => {
        return (
          <div key={ item } className={ style.listItem }>
            <div className={ style.listItemContent }>电台图片{ index + 1 }</div>
            <div className={ style.listItemActions }>
              <ImagePreview src={ source(item) } />
            </div>
            <div className={ style.listItemActions }>
              <a href={ item } role="button" aria-label="下载" onClick={ handleDownloadClick }>下载</a>
            </div>
          </div>
        );
      });
    } else {
      return null;
    }
  }

  // 下载所有图片
  async function handleDownloadAllImagesClick(event: MouseEvent): Promise<void> {
    try {
      const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openDirectory'] });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

      // 保存的目录
      const dir: string = path.join(result.filePaths[0], `[口袋48图片]${ liveInfo.userInfo.nickname }_${ liveInfo.title }`);
      const imageFiles: Array<string> = [coverPath].concat(carousels ?? []);

      // 创建目录
      if (!fs.existsSync(dir)) {
        await fsP.mkdir(dir);
      }

      const queue: Array<Promise<void>> = imageFiles.map(function(item: string, index: number): Promise<void> {
        const pathResult: ParsedPath = path.parse(item);
        const filePath: string = path.join(dir, pathResult.base);

        return requestDownloadFileByStream(source(item), filePath);
      });

      await Promise.all(queue);
      messageApi.success('图片下载完成！');
    } catch (err) {
      console.error(err);
      console.error('图片下载失败！');
    }
  }

  return (
    <Fragment>
      <div className="p-[8px] h-[200px] overflow-auto">
        <Button className="mb-[8px]" icon={ <IconCloudDownloadOutlined /> } onClick={ handleDownloadAllImagesClick }>
          下载全部图片到文件夹
        </Button>
        <Image.PreviewGroup>
          <div className={ style.listItem }>
            <div className={ style.listItemContent }>封面图</div>
            <div className={ style.listItemActions }>
              <ImagePreview src={ source(coverPath) } />
            </div>
            <div className={ style.listItemActions }>
              <a href={ coverPath } role="button" aria-label="下载" onClick={ handleDownloadClick }>下载</a>
            </div>
          </div>
          { carouselsRender() }
        </Image.PreviewGroup>
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

/**
 * 弹出层打开图片下载
 * @param { Omit<ModalStaticFunctions, 'warn'> } modalApi
 * @param { LiveInfo } liveInfo - 直播信息
 * @param { string } coverPath - 封面
 * @param { Array<string> } [carousels] - 电台轮播图
 */
function downloadImages(
  modalApi: Omit<ModalStaticFunctions, 'warn'>,
  liveInfo: LiveInfo,
  coverPath: string,
  carousels?: Array<string>
): void {
  modalApi.info({
    title: '图片下载',
    width: 420,
    centered: true,
    content: <DownloadImages liveInfo={ liveInfo } coverPath={ coverPath } carousels={ carousels } />
  });
}

export default downloadImages;