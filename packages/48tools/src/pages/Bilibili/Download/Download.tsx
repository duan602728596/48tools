import * as path from 'path';
import type { ParsedPath } from 'path';
import * as url from 'url';
import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, ReactElement, ReactNode, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash-es';
import Header from '../../../components/Header/Header';
import AddForm from './AddForm';
import { setDownloadList, setDownloadProgress, BilibiliDownloadInitialState } from '../reducers/download';
import DownloadBilibiliVideoWorker from 'worker-loader!./downloadBilibiliVideo.worker';
import type { MessageEventData } from './downloadBilibiliVideo.worker';
import type { DownloadItem } from '../types';

/* state */
type RSelector = Pick<BilibiliDownloadInitialState, 'downloadList' | 'downloadProgress'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: createSelector(
    ({ bilibiliDownload }: { bilibiliDownload: BilibiliDownloadInitialState }): Array<DownloadItem> => bilibiliDownload.downloadList,
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  ),
  // 进度条列表
  downloadProgress: createSelector(
    ({ bilibiliDownload }: { bilibiliDownload: BilibiliDownloadInitialState }): { [key: string]: number } => bilibiliDownload.downloadProgress,
    (data: { [key: string]: number }): { [key: string]: number } => data
  )
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const urlResult: url.URL = new url.URL(item.durl);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
        defaultPath: `[B站下载]${ item.type }${ item.id }_${ item.page }${ parseResult.ext }`
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = new DownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = event.data;

        dispatch(setDownloadProgress(event.data));

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
    const index: number = findIndex(downloadList, { qid: item.qid });

    if (index >= 0) {
      const newList: Array<DownloadItem> = [...downloadList];

      newList.splice(index, 1);
      dispatch(setDownloadList(newList));
    }
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    { title: '下载类型', dataIndex: 'type' },
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
        <AddForm />
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