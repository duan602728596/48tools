import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import * as url from 'node:url';
import type { SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, ReactElement, ReactNode, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import getDownloadBilibiliVideoWorker from './downloadBilibiliVideo.worker/getDownloadBilibiliVideoWorker';
import type { MessageEventData } from './downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';
import Header from '../../../components/Header/Header';
import AddForm, { bilibiliVideoTypesMap } from './AddForm/AddForm';
import {
  bilibiliDownloadListSelectors,
  setDeleteDownloadList,
  setDownloadProgress,
  BilibiliDownloadInitialState
} from '../reducers/download';
import BilibiliLogin from '../../../components/BilibiliLogin/BilibiliLogin';
import type { DownloadItem } from '../types';

/* redux selector */
type RSelector = Pick<BilibiliDownloadInitialState, 'downloadProgress'> & {
  downloadList: Array<DownloadItem>;
};

const selector: Selector<any, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: createSelector(
    ({ bilibiliDownload }: { bilibiliDownload: BilibiliDownloadInitialState }): Array<DownloadItem> => {
      return bilibiliDownloadListSelectors.selectAll(bilibiliDownload);
    },
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  ),
  // 进度条列表
  downloadProgress: createSelector(
    ({ bilibiliDownload }: { bilibiliDownload: BilibiliDownloadInitialState }): { [key: string]: number } => {
      return bilibiliDownload.downloadProgress;
    },
    (data: { [key: string]: number }): { [key: string]: number } => data
  )
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const urlResult: url.URL = new url.URL(item.durl);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
        defaultPath: `[B站下载]${ item.type }${ item.id }_${ item.page }${ parseResult.ext }`
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getDownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = event1.data;

        dispatch(setDownloadProgress(event1.data));

        if (type === 'success') {
          message.success('下载完成！');
          worker.terminate();
        }
      });

      worker.postMessage({
        type: 'start',
        filePath: result.filePath,
        durl: item.durl,
        qid: item.qid
      });
    } catch (err) {
      console.error(err);
      message.error('视频下载失败！');
    }
  }

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setDeleteDownloadList(item.qid));
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    {
      title: '下载类型',
      dataIndex: 'type',
      render: (value: string, record: DownloadItem, index: number): string => bilibiliVideoTypesMap[value]
    },
    { title: '分页', dataIndex: 'page' },
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
        <Button.Group>
          <BilibiliLogin />
          <AddForm />
        </Button.Group>
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

export default Download;