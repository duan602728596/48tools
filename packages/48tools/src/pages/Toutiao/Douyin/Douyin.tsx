import * as path from 'path';
import type { ParsedPath } from 'path';
import * as url from 'url';
import type { SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import * as filenamify from 'filenamify';
import { Fragment, ReactElement, ReactNode, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import DownloadBilibiliVideoWorker from 'worker-loader!../../Bilibili/Download/downloadBilibiliVideo.worker';
import type { MessageEventData } from '../../Bilibili/Download/downloadBilibiliVideo.worker';
import Header from '../../../components/Header/Header';
import Add from './Add';
import {
  douyinDownloadListSelectors,
  setDeleteDownloadList,
  setDownloadProgress,
  DouyinDownloadInitialState
} from '../reducers/douyin';
import { requestGetVideoRedirectUrl } from '../services/douyin';
import type { DownloadItem } from '../types';

/* redux selector */
type RSelector = Pick<DouyinDownloadInitialState, 'downloadProgress'> & {
  downloadList: Array<DownloadItem>;
};

const selector: Selector<any, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: createSelector(
    ({ douyinDownload }: { douyinDownload: DouyinDownloadInitialState }): Array<DownloadItem> => {
      return douyinDownloadListSelectors.selectAll(douyinDownload);
    },
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  ),
  // 进度条列表
  downloadProgress: createSelector(
    ({ douyinDownload }: { douyinDownload: DouyinDownloadInitialState }): { [key: string]: number } => {
      return douyinDownload.downloadProgress;
    },
    (data: { [key: string]: number }): { [key: string]: number } => data
  )
});

/* 抖音视频下载 */
function Douyin(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setDeleteDownloadList(item.qid));
  }

  // 下载（测试ID：6902337717137329412）
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const urlResult: url.URL = new url.URL(item.url);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
        defaultPath: `[抖音]${ filenamify(item.title) }.mp4`
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = new DownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = event1.data;

        dispatch(setDownloadProgress(event1.data));

        if (type === 'success') {
          message.success('下载完成！');
          worker.terminate();
        }
      });

      let uri: string = item.url;

      // 对抖音视频地址302重定向的处理
      if (/douyin\.com/.test(uri)) {
        const res: string = await requestGetVideoRedirectUrl(item.url);
        const document: Document = new DOMParser().parseFromString(res, 'text/html');

        uri = document.querySelector('a')!.getAttribute('href')!;
      }

      worker.postMessage({
        type: 'start',
        filePath: result.filePath,
        durl: uri,
        qid: item.qid
      });
    } catch (err) {
      console.error(err);
      message.error('视频下载失败！');
    }
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: '标题', dataIndex: 'title' },
    {
      title: '下载进度',
      dataIndex: 'qid',
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
              onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadClick(record, event) }
            >
              下载
            </Button>
            <Button type="primary"
              danger={ true }
              disabled={ inDownload }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteTaskClick(record, event) }
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
        <Add />
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Douyin;