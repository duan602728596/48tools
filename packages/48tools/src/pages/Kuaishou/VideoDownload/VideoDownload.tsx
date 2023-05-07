import type { SaveDialogReturnValue } from 'electron';
import { Fragment, MouseEvent, type ReactElement, type ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import * as classNames from 'classnames';
import commonStyle from '../../../common.sass';
import { showSaveDialog } from '../../../utils/remote/dialog';
import Header from '../../../components/Header/Header';
import Search from './Search/Search';
import {
  kuaishouDownloadListSelectors,
  setDeleteVideoDownloadList,
  setDownloadProgress,
  type KuaishouVideoDownloadInitialState
} from '../reducers/kuaishouVideoDownload';
import { ProgressNative, type ProgressSet } from '../../../components/ProgressNative/index';
import { kuaishouCookie } from './function/kuaishouCookie';
import getDownloadBilibiliVideoWorker from '../../Bilibili/Download/function/downloadBilibiliVideo.worker/getDownloadBilibiliVideoWorker';
import type { MessageEventData } from '../../Bilibili/Download/function/downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';
import type { DownloadItem } from '../types';

/* redux selector */
type RSelector = Pick<KuaishouVideoDownloadInitialState, 'downloadProgress'> & {
  downloadList: Array<DownloadItem>;
};
type RState = { kuaishouVideoDownload: KuaishouVideoDownloadInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: ({ kuaishouVideoDownload }: RState): Array<DownloadItem> => kuaishouDownloadListSelectors.selectAll(kuaishouVideoDownload),

  // 进度条列表
  downloadProgress: ({ kuaishouVideoDownload }: RState): { [key: string]: ProgressSet } => kuaishouVideoDownload.downloadProgress
});

/* 快手视频下载 */
function VideoDownload(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 清除快手的cookie
  function handleClearKuaishouCookie(event: MouseEvent): void {
    kuaishouCookie.clean();
    messageApi.success('Cookie已清除！');
  }

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent): void {
    dispatch(setDeleteVideoDownloadList(item.qid));
  }

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      const defaultPathTitle: string = `[快手]${ filenamify(item.title) }.mp4`;

      const result: SaveDialogReturnValue = await showSaveDialog({ defaultPath: defaultPathTitle });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getDownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = messageEvent.data;

        dispatch(setDownloadProgress(messageEvent.data));

        if (type === 'success') {
          messageApi.success('下载完成！');
          worker.terminate();
        }
      });

      worker.postMessage({
        type: 'start',
        filePath: result.filePath,
        durl: item.url,
        qid: item.qid,
        headers: {}
      });
    } catch (err) {
      console.error(err);
      messageApi.error('下载失败！');
    }
  }

  const columns: ColumnsType<DownloadItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '下载进度',
      dataIndex: 'qid',
      width: 95,
      render: (value: string, record: DownloadItem, index: number): ReactNode => {
        const inDownload: boolean = value in downloadProgress;

        if (inDownload) {
          return <ProgressNative progressSet={ downloadProgress[value] } />;
        } else {
          return '等待下载';
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 155,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        const inDownload: boolean = Object.hasOwn(downloadProgress, record.qid);

        return (
          <Button.Group>
            <Button disabled={ inDownload }
              onClick={ (event: MouseEvent): Promise<void> => handleDownloadClick(record, event) }
            >
              下载
            </Button>
            <Button type="primary"
              danger={ true }
              disabled={ inDownload }
              onClick={ (event: MouseEvent): void => handleDeleteTaskClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <Search />
        <Button type="primary" danger={ true } onClick={ handleClearKuaishouCookie }>清除快手Cookie的缓存</Button>
      </Header>
      <p className={ classNames('mb-[4px] text-[12px]', commonStyle.text) }>
        第一次下载时或获取快手Cookie失败时，需要进入快手首页进行一些操作后，关闭窗口。然后才能正常下载。
        <br />
        如果窗口内出现没有视频的情况，请点击首页，进行滑动验证码的操作，然后关闭窗口。
      </p>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{ showQuickJumper: true }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default VideoDownload;