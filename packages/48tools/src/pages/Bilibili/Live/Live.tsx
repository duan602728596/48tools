import { setInterval, clearInterval } from 'node:timers';
import type { SaveDialogReturnValue } from 'electron';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, message, Popconfirm, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { requestRoomInitData, requestRoomPlayerUrlV2, type RoomInit, type RoomPlayUrlV2 } from '@48tools-api/bilibili/live';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import Header from '../../../components/Header/Header';
import AddLiveRoomForm from '../../../components/AddLiveRoomForm/AddLiveRoomForm';
import BilibiliLogin from '../../../functionalComponents/BilibiliLogin/BilibiliLogin';
import AutoRecordingSavePath from '../../../components/AutoRecordingSavePath/AutoRecordingSavePath';
import {
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBSaveAutoRecordLiveItem,
  IDBDeleteLiveItem,
  setAddWorkerItem,
  setRemoveWorkerItem,
  setAutoRecordTimer,
  selectorsObject
} from '../reducers/bilibiliLive';
import dbConfig from '../../../utils/IDB/IDBConfig';
import { getFFmpeg, getFileTime } from '../../../utils/utils';
import bilibiliAutoRecord from './function/bilibiliAutoRecord';
import { localStorageKey, createV2LiveUrl } from './function/helper';
import type { WebWorkerChildItem, MessageEventData, LiveItem } from '../../../commonTypes';
import type { LiveSliceInitialState, LiveSliceSelector } from '../../../store/slice/LiveSlice';

/* redux selector */
type RState = { bilibiliLive: LiveSliceInitialState };

const selector: Selector<RState, LiveSliceSelector> = createStructuredSelector({ ...selectorsObject });

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { liveList, workerList, autoRecordTimer }: LiveSliceSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 停止自动录制
  function handleAutoRecordStopClick(event: MouseEvent): void {
    clearInterval(autoRecordTimer!);
    dispatch(setAutoRecordTimer(null));
  }

  // 自动录制
  function handleAutoRecordStartClick(event: MouseEvent): void {
    const bilibiliAutoRecordSavePath: string | null = localStorage.getItem(localStorageKey);

    if (bilibiliAutoRecordSavePath) {
      dispatch(setAutoRecordTimer(setInterval(bilibiliAutoRecord, 60_000)));
      bilibiliAutoRecord();
    } else {
      messageApi.warning('请先配置视频自动保存的目录！');
    }
  }

  // 修改自动录制的checkbox
  function handleAutoRecordCheck(record: LiveItem, event: CheckboxChangeEvent): void {
    dispatch(IDBSaveAutoRecordLiveItem({
      data: { ...record, autoRecord: event.target.checked }
    }));
  }

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = workerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      workerList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent): Promise<void> {
    const time: string = getFileTime();

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);

      if (resInit.data.live_status !== 1) {
        messageApi.warning('直播未开始。');

        return;
      }

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[B站直播]${ record.roomId }_${ time }.flv`
      });

      if (result.canceled || !result.filePath) return;

      const resPlayUrl: RoomPlayUrlV2 = await requestRoomPlayerUrlV2(`${ resInit.data.room_id }`);
      const playStreamPath: string | null = createV2LiveUrl(resPlayUrl);

      if (!playStreamPath) {
        messageApi.warning('直播获取错误。');

        return;
      }


      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setRemoveWorkerItem(record.id));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddWorkerItem({
        id: record.id,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('录制失败！');
    }
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent): void {
    dispatch(IDBDeleteLiveItem({
      query: record.id
    }));
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
    {
      title: '自动录制',
      dataIndex: 'autoRecord',
      width: 100,
      render: (value: boolean, record: LiveItem, index: number): ReactElement => (
        <Checkbox checked={ value }
          disabled={ autoRecordTimer !== null }
          onChange={ (event: CheckboxChangeEvent): void => handleAutoRecordCheck(record, event) }
        />
      )
    },
    {
      title: '操作',
      key: 'handle',
      width: 175,
      render: (value: undefined, record: LiveItem, index: number): ReactElement => {
        const idx: number = workerList.findIndex((o: WebWorkerChildItem) => o.id === record.id);

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止录制吗？"
                  onConfirm={ (event?: MouseEvent ): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止录制</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent ): Promise<void> => handleRecordClick(record, event) }>
                  开始录制
                </Button>
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ idx >= 0 || autoRecordTimer !== null }
              onClick={ (event: MouseEvent): void => handleDeleteRoomIdClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(IDBCursorLiveList({
      query: { indexName: dbConfig.objectStore[0].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <Button.Group>
          <BilibiliLogin />
          <AddLiveRoomForm dataTestId="bilibili-add-live-id-btn"
            modalTitle="添加B站直播间信息"
            tips="直播间ID支持配置短ID。"
            IDBSaveDataFunc={ IDBSaveLiveItem }
          />
          <AutoRecordingSavePath localStorageItemKey={ localStorageKey } />
          {
            autoRecordTimer === null
              ? <Button onClick={ handleAutoRecordStartClick }>自动录制</Button>
              : <Button type="primary" danger={ true } onClick={ handleAutoRecordStopClick }>停止录制</Button>
          }
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[0].key }
        pagination={{
          showQuickJumper: true
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Live;