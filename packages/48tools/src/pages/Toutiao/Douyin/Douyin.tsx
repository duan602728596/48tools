import type { SaveDialogReturnValue } from 'electron';
import { Fragment, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getDownloadBilibiliVideoWorker from '../../Bilibili/Download/downloadBilibiliVideo.worker/getDownloadBilibiliVideoWorker';
import type { MessageEventData } from '../../Bilibili/Download/downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';
import Header from '../../../components/Header/Header';
import VideoOrUserParse from './VideoOrUserParse/VideoOrUserParse';
import douyinCookieCache from './DouyinCookieCache';
import {
  douyinDownloadListSelectors,
  setDeleteDownloadList,
  setDownloadProgress,
  type DouyinDownloadInitialState
} from '../reducers/douyin';
import { requestGetVideoRedirectUrl } from '../services/douyin';
import type { DownloadItem } from '../types';

/* redux selector */
type RSelector = Pick<DouyinDownloadInitialState, 'downloadProgress'> & {
  downloadList: Array<DownloadItem>;
};
type RState = { douyinDownload: DouyinDownloadInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: ({ douyinDownload }: RState): Array<DownloadItem> => douyinDownloadListSelectors.selectAll(douyinDownload),

  // 进度条列表
  downloadProgress: ({ douyinDownload }: RState): { [key: string]: number } => douyinDownload.downloadProgress
});

/* 抖音视频下载 */
function Douyin(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 清除抖音的cookie
  function handleClearDouyinCookie(event: MouseEvent): void {
    douyinCookieCache.clearCookie();
    messageApi.success('Cookie已清除！');
  }

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent): void {
    dispatch(setDeleteDownloadList(item.qid));
  }

  // 下载（测试ID：6902337717137329412）
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      let defaultPathTitle: string = `[抖音]${ filenamify(item.title) }`;

      if (typeof item.width === 'number' && typeof item.height === 'number') {
        defaultPathTitle += `_${ item.width }x${ item.height }`;
      }

      const result: SaveDialogReturnValue = await showSaveDialog({ defaultPath: `${ defaultPathTitle }.mp4` });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getDownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = event1.data;

        dispatch(setDownloadProgress(event1.data));

        if (type === 'success') {
          messageApi.success('下载完成！');
          worker.terminate();
        }
      });

      let uri: string = item.url;

      // 对抖音视频地址302重定向的处理
      if (/douyin\.com/.test(uri)) {
        const res: string = await requestGetVideoRedirectUrl(item.url);
        const parseDocument: Document = new DOMParser().parseFromString(res, 'text/html');

        uri = parseDocument.querySelector('a')!.getAttribute('href')!;
      }

      worker.postMessage({
        type: 'start',
        filePath: result.filePath,
        durl: uri,
        qid: item.qid,
        headers: {}
      });
    } catch (err) {
      console.error(err);
      messageApi.error('视频下载失败！');
    }
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: '标题', dataIndex: 'title' },
    {
      title: '视频尺寸',
      key: 'width_height',
      width: 120,
      render: (value: undefined, record: DownloadItem, index: number): ReactNode => {
        if (typeof record.width === 'number' && typeof record.height === 'number') {
          return `${ record.width } * ${ record.height }`;
        } else {
          return '无水印';
        }
      }
    },
    {
      title: '下载进度',
      dataIndex: 'qid',
      width: 95,
      render: (value: string, record: DownloadItem, index: number): ReactNode => {
        const inDownload: boolean = value in downloadProgress;

        if (inDownload) {
          return <Progress type="circle" width={ 30 } percent={ downloadProgress[value] } />;
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
        const inDownload: boolean = record.qid in downloadProgress;

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
        <VideoOrUserParse />
        <Button type="primary" danger={ true } onClick={ handleClearDouyinCookie }>清除抖音Cookie的缓存</Button>
      </Header>
      <p className="mb-[4px] text-[12px]">输入视频ID下载单个视频，输入用户ID或用户主页地址可解析用户的所有视频并选择下载。</p>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Douyin;