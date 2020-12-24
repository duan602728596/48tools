import * as path from 'path';
import type { ParsedPath } from 'path';
import * as url from 'url';
import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, ReactElement, ReactNode, MouseEvent } from 'react';
import { observer, Observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from '../../48/index.sass';
import bilibiliStore from '../models/bilibili';
import AddForm from './AddForm';
import DownloadBilibiliVideoWorker from 'worker-loader!./downloadBilibiliVideo.worker';
import type { MessageEventData } from './downloadBilibiliVideo.worker';
import type { DownloadItem } from '../types';

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, downloadProgress, setDeleteDownloadListTask, setDownloadProgress }: typeof bilibiliStore = bilibiliStore;

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const urlResult: url.URL = new url.URL(item.durl);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
        defaultPath: `${ item.id }_${ item.page }${ parseResult.ext }`
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = new DownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>): void {
        const { type, qid, data }: MessageEventData = event.data;

        if (type === 'progress') {
          setDownloadProgress(qid, data);
        } else if (type === 'success') {
          message.success('下载完成！');
          setDownloadProgress(qid, 0, true); // 下载完成
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
  function handleDeleteTaskClick(record: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    setDeleteDownloadListTask(record);
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    { title: '下载类型', dataIndex: 'type' },
    { title: '分页', dataIndex: 'page' },
    {
      title: '下载进度',
      dataIndex: 'qid',
      render: (value: string, record: DownloadItem, index: number): ReactNode => (
        <Observer>
          {
            (): ReactElement => (value in downloadProgress)
              ? <Progress type="circle" width={ 30 } percent={ downloadProgress[value] } />
              : <span>等待下载</span>
          }
        </Observer>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 155,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => (
        <Observer>
          {
            (): ReactElement => {
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
        </Observer>
      )
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

export default observer(Download);