import * as path from 'path';
import type { ParsedPath } from 'path';
import { remote, SaveDialogReturnValue } from 'electron';
import type { ReactElement, ReactNodeArray, MouseEvent } from 'react';
import { Modal, message } from 'antd';
import style from './downloadImages.sass';
import { source } from '../../../../utils/utils';
import { requestDownloadFileByStream } from '../../services/pocket48';
import type { LiveInfo } from '../../services/interface';

interface DownloadImagesProps {
  liveInfo: LiveInfo;
  coverPath: string;
  carousels?: Array<string>;
}

/* 图片下载 */
function DownloadImages(props: DownloadImagesProps): ReactElement {
  const { liveInfo, coverPath, carousels }: DownloadImagesProps = props;

  // 下载图片
  async function handleDownloadClick(event: MouseEvent<HTMLAnchorElement>): Promise<void> {
    event.preventDefault();

    try {
      const href: string = event.target['getAttribute']('href');
      const pathResult: ParsedPath = path.parse(href);
      const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
        defaultPath: `[口袋48图片]${ liveInfo.userInfo.nickname }_${ liveInfo.title }_${ pathResult.base }`
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(source(href), result.filePath);
      message.success('图片下载完成！');
    } catch (err) {
      console.error(err);
      console.error('图片下载失败！');
    }
  }

  // 渲染其他图片
  function carouselsRender(): ReactNodeArray | null {
    if (carousels?.length) {
      return carousels.map((item: string, index: number): ReactElement => {
        return (
          <div key={ item } className={ style.listItem }>
            <div className={ style.listItemContent }>电台图片{ index + 1 }</div>
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

  return (
    <div className={ style.content }>
      <div className={ style.listItem }>
        <div className={ style.listItemContent }>封面图</div>
        <div className={ style.listItemActions }>
          <a href={ coverPath } role="button" aria-label="下载" onClick={ handleDownloadClick }>下载</a>
        </div>
      </div>
      { carouselsRender() }
    </div>
  );
}

/**
 * 弹出层打开图片下载
 * @param { LiveInfo } liveInfo: 直播信息
 * @param { string } coverPath: 封面
 * @param { Array<string> } carousels?: 电台轮播图
 */
function downloadImages(liveInfo: LiveInfo, coverPath: string, carousels?: Array<string>): void {
  Modal.info({
    title: '图片下载',
    width: 420,
    centered: true,
    content: <DownloadImages liveInfo={ liveInfo } coverPath={ coverPath } carousels={ carousels } />
  });
}

export default downloadImages;