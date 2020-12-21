import * as path from 'path';
import type { ParsedPath } from 'path';
import * as url from 'url';
import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, ReactElement, ReactNode, MouseEvent } from 'react';
import type { Store, Dispatch } from 'redux';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash';
import style from '../../48/index.sass';
import AddForm from './AddForm';
import { setDownloadList, setDownloadProgress, BilibiliInitialState } from '../reducers/reducers';
import DownloadBilibiliVideoWorker from 'worker-loader!./downloadBilibiliVideo.worker';
import type { DownloadItem } from '../types';

/* state */
type RSelector = Pick<BilibiliInitialState, 'downloadList' | 'downloadProgress'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): Array<DownloadItem> => bilibili.downloadList,
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  ),
  // 进度条列表
  downloadProgress: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): { [key: string]: number } => bilibili.downloadProgress,
    (data: { [key: string]: number }): { [key: string]: number } => data
  )
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const store: Store = useStore();
  const { downloadList, downloadProgress }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const urlResult: url.URL = new url.URL(item.durl);
    const parseResult: ParsedPath = path.parse(urlResult.pathname);
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `${ item.id }_${ item.page }${ parseResult.ext }`
    });

    if (result.canceled || !result.filePath) return;

    const worker: Worker = new DownloadBilibiliVideoWorker();

    type EventData = {
      type: 'success' | 'progress';
      qid: string;
      data: number;
    };

    worker.addEventListener('message', function(event: MessageEvent<EventData>): void {
      const downloadProgress: { [key: string]: number } = { ...store.getState().bilibili.downloadProgress };
      const { type, qid, data }: EventData = event.data;

      if (type === 'progress') {
        downloadProgress[qid] = data;
      } else if (type === 'success') {
        message.success('下载完成！');
        delete downloadProgress[qid]; // 下载完成
      }

      dispatch(setDownloadProgress(downloadProgress));
      (type === 'success') && worker.terminate();
    });

    worker.postMessage({
      type: 'start',
      filePath: result.filePath,
      durl: item.durl,
      qid: item.qid
    });
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
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </div>
        <div>
          <AddForm />
        </div>
      </header>
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