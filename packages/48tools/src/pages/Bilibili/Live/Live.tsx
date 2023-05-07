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
import { showSaveDialog } from '../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpeg/getFFmpegDownloadWorker';
import Header from '../../../components/Header/Header';
import AddLiveRoomForm from '../../../components/AddLiveRoomForm/AddLiveRoomForm';
import BilibiliLogin from '../../../functionalComponents/BilibiliLogin/BilibiliLogin';
import AutoRecordingSavePath from './AutoRecordingSavePath/AutoRecordingSavePath';
import {
  IDBSaveBilibiliLiveList,
  IDBCursorBilibiliLiveList,
  IDBDeleteBilibiliLiveList,
  IDBUpdateBilibiliLiveList,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList,
  setAutoRecordTimer,
  type BilibiliLiveInitialState
} from '../reducers/live';
import dbConfig from '../../../utils/IDB/IDBConfig';
import { requestRoomInitData, requestRoomPlayerUrl } from '../services/live';
import { getFFmpeg, getFileTime } from '../../../utils/utils';
import bilibiliAutoRecord from './function/bilibiliAutoRecord';
import type { WebWorkerChildItem, MessageEventData } from '../../../commonTypes';
import type { LiveItem } from '../types';
import type { RoomInit, RoomPlayUrl } from '../services/interface';

/* redux selector */
type RState = { bilibiliLive: BilibiliLiveInitialState };

const selector: Selector<RState, BilibiliLiveInitialState> = createStructuredSelector({
  // 直播间列表
  bilibiliLiveList: ({ bilibiliLive }: RState): Array<LiveItem> => bilibiliLive.bilibiliLiveList,

  // 直播下载
  liveChildList: ({ bilibiliLive }: RState): Array<WebWorkerChildItem> => bilibiliLive.liveChildList,

  // 自动录制直播
  autoRecordTimer: ({ bilibiliLive }: RState): NodeJS.Timer | null => bilibiliLive.autoRecordTimer
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { bilibiliLiveList, liveChildList, autoRecordTimer }: BilibiliLiveInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 停止自动录制
  function handleAutoRecordStopClick(event: MouseEvent): void {
    clearInterval(autoRecordTimer!);
    dispatch(setAutoRecordTimer(null));
  }

  // 自动录制
  function handleAutoRecordStartClick(event: MouseEvent): void {
    const bilibiliAutoRecordSavePath: string | null = localStorage.getItem('BILIBILI_AUTO_RECORD_SAVE_PATH');

    if (bilibiliAutoRecordSavePath) {
      dispatch(setAutoRecordTimer(setInterval(bilibiliAutoRecord, 60_000)));
    } else {
      messageApi.warning('请先配置视频自动保存的目录！');
    }
  }

  // 修改自动录制的checkbox
  function handleAutoRecordCheck(record: LiveItem, event: CheckboxChangeEvent): void {
    dispatch(IDBUpdateBilibiliLiveList({
      data: { ...record, autoRecord: event.target.checked }
    }));
  }

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
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

      const resPlayUrl: RoomPlayUrl = await requestRoomPlayerUrl(`${ resInit.data.room_id }`);
      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveBilibiliChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resPlayUrl.data.durl[0].url,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        ua: true,
        ffmpegHeaders: `Referer: https://live.bilibili.com/${ record.roomId }\r
Host: live.bilibili.com\r
Origin: https://live.bilibili.com\r\n`
      });

      dispatch(setAddLiveBilibiliChildList({
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
    dispatch(IDBDeleteBilibiliLiveList({
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
        const idx: number = liveChildList.findIndex((o: WebWorkerChildItem) => o.id === record.id);

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
              disabled={ idx >= 0 }
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
    dispatch(IDBCursorBilibiliLiveList({
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
            IDBSaveDataFunc={ IDBSaveBilibiliLiveList }
          />
          <AutoRecordingSavePath />
          {
            autoRecordTimer === null
              ? <Button onClick={ handleAutoRecordStartClick }>自动录制</Button>
              : <Button type="primary" danger={ true } onClick={ handleAutoRecordStopClick }>停止录制</Button>
          }
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ bilibiliLiveList }
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