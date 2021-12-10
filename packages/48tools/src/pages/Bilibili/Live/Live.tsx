import type { SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import getFFMpegDownloadWorker from '../../../utils/worker/getFFMpegDownloadWorker';
import Header from '../../../components/Header/Header';
import BilibiliLogin from '../../../components/BilibiliLogin/BilibiliLogin';
import AddForm from './AddForm';
import {
  idbCursorBilibiliLiveList,
  idbDeleteBilibiliLiveList,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList,
  type BilibiliLiveInitialState
} from '../reducers/live';
import dbConfig from '../../../utils/idb/dbConfig';
import { requestRoomInitData, requestRoomPlayerUrl } from '../services/live';
import { getFFmpeg, getFileTime } from '../../../utils/utils';
import type { WebWorkerChildItem, MessageEventData } from '../../../types';
import type { LiveItem } from '../types';
import type { RoomInit, RoomPlayUrl } from '../services/interface';

/* redux selector */
type RState = { bilibiliLive: BilibiliLiveInitialState };

const selector: Selector<RState, BilibiliLiveInitialState> = createStructuredSelector({
  // 直播间列表
  bilibiliLiveList: ({ bilibiliLive }: RState): Array<LiveItem> => bilibiliLive.bilibiliLiveList,

  // 直播下载
  liveChildList: ({ bilibiliLive }: RState): Array<WebWorkerChildItem> => bilibiliLive.liveChildList
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { bilibiliLiveList, liveChildList }: BilibiliLiveInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 停止
  function handleStopClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: `[B站直播]${ record.roomId }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);
      const resPlayUrl: RoomPlayUrl = await requestRoomPlayerUrl(`${ resInit.data.room_id }`);
      const worker: Worker = getFFMpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveBilibiliChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resPlayUrl.data.durl[0].url,
        filePath: result.filePath,
        id: record.id,
        ffmpeg: getFFmpeg(),
        ua: true
      });

      dispatch(setAddLiveBilibiliChildList({
        id: record.id,
        worker
      }));
    } catch (err) {
      console.error(err);
      message.error('录制失败！');
    }
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(idbDeleteBilibiliLiveList({
      query: record.id
    }));
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
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
                  onConfirm={ (event: MouseEvent<HTMLButtonElement> ): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止录制</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent<HTMLButtonElement> ): Promise<void> => handleRecordClick(record, event) }>
                  开始录制
                </Button>
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ idx >= 0 }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteRoomIdClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(idbCursorBilibiliLiveList({
      query: { indexName: dbConfig.objectStore[0].data[1] }
    }));
  }, []);

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
        dataSource={ bilibiliLiveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[0].key }
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Live;