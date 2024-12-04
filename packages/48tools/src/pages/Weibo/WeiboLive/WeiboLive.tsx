import { randomUUID } from 'node:crypto';
import type { SaveDialogReturnValue } from 'electron';
import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { App, Tag, Table, Button, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { useAppProps } from 'antd/es/app/context';
import filenamify from 'filenamify/browser';
import { showSaveDialog } from '../../../utils/remote/dialog';
import Header from '../../../components/Header/Header';
import AddLiveUrlForm from './AddLiveUrlForm/AddLiveUrlForm';
import { setLiveOne, setRemoveLiveOne, selectorsObject, type WeiboLiveInitialState } from '../reducers/weiboLive';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { getFFmpeg, getFileTime } from '../../../utils/utils';
import { omit } from '../../../utils/lodash';
import type { LiveItem } from '../types';
import type { MessageEventData } from '../../../commonTypes';

/* redux selector */
type RSelector = { liveList: Array<LiveItem> };
type RState = { weiboLive: WeiboLiveInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({ ...selectorsObject });

/* 微博直播 */
function WeiboLive(props: {}): ReactElement {
  const { liveList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();

  // 停止录制
  function handleStopRecordLiveClick(item: LiveItem, event?: MouseEvent): void {
    item.worker.postMessage({ type: 'stop' });
  }

  // 删除
  function handleDeleteLiveClick(item: LiveItem, event?: MouseEvent): void {
    dispatch(setRemoveLiveOne(item.qid));
  }

  /**
   * 获取微博直播
   * @param { Omit<LiveItem, 'qid' | 'worker' | 'status'> } info - 录制信息
   * @param { string } [qid1] - 如果有qid，则更新（重新下载），否则为添加
   */
  async function onGetLiveInfoCallback(info: Omit<LiveItem, 'qid' | 'worker' | 'status'>, qid1?: string): Promise<void> {
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: filenamify(`[微博直播]${ info.liveId }_${ info.title }_${ time }.flv`)
    });

    if (result.canceled || !result.filePath) return;

    const qid: string = qid1 ?? randomUUID();
    const worker: Worker = getFFmpegDownloadWorker();

    worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
      const { type, error }: MessageEventData = event1.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          messageApi.error(`${ info.title }[${ info.liveId }]录制失败！`);
        }

        worker.terminate();
        dispatch(setLiveOne({
          qid,
          ...info,
          worker,
          status: 0
        }));
      }
    });

    worker.postMessage({
      type: 'start',
      playStreamPath: info.url,
      filePath: result.filePath,
      ua: true,
      ffmpeg: getFFmpeg()
    });

    dispatch(setLiveOne({
      qid,
      ...info,
      worker,
      status: 1
    }));
  }

  // 重新下载
  function handleReDownloadLiveClick(item: LiveItem, event?: MouseEvent): void {
    onGetLiveInfoCallback(omit(item, ['qid', 'worker', 'status']), item.qid);
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '标题', dataIndex: 'title' },
    { title: '直播间ID', dataIndex: 'liveId' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: 0 | 1, record: LiveItem, index: number): ReactElement => {
        return status ? <Tag color="cyan">录制中</Tag> : <Tag color="red">已停止</Tag>;
      }
    },
    {
      title: '操作',
      key: 'handle',
      width: 200,
      render: (value: undefined, record: LiveItem, index: number): ReactElement | undefined => {
        if (record.status === 1) {
          return (
            <Popconfirm title="确定要停止录制吗？"
              onConfirm={ (e?: MouseEvent): void => handleStopRecordLiveClick(record, e) }
            >
              <Button type="primary" danger={ true }>停止录制</Button>
            </Popconfirm>
          );
        }

        if (record.status === 0) {
          return (
            <Button.Group>
              <Button onClick={ (e: MouseEvent): void => handleReDownloadLiveClick(record, e) }>重新下载</Button>
              <Popconfirm title="确定要删除吗？"
                onConfirm={ (e?: MouseEvent): void => handleDeleteLiveClick(record, e) }
              >
                <Button type="primary" danger={ true }>删除</Button>
              </Popconfirm>
            </Button.Group>
          );
        }
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <AddLiveUrlForm onGetLiveInfoCallback={ onGetLiveInfoCallback } />
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default WeiboLive;