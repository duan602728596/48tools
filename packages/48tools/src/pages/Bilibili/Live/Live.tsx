import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, ReactElement, useEffect, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash-es';
import * as moment from 'moment';
import FFMpegDownloadWorker from 'worker-loader!../../../utils/worker/FFMpegDownload.worker';
import Header from '../../../components/Header/Header';
import BilibiliLogin from '../../../components/BilibiliLogin/BilibiliLogin';
import AddForm from './AddForm';
import {
  idbCursorBilibiliLiveList,
  idbDeleteBilibiliLiveList,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList,
  BilibiliLiveInitialState
} from '../reducers/live';
import dbConfig from '../../../utils/idb/dbConfig';
import { requestRoomInitData, requestRoomPlayerUrl } from '../services/live';
import { getFFmpeg } from '../../../utils/utils';
import type { WebWorkerChildItem, MessageEventData } from '../../../types';
import type { LiveItem } from '../types';
import type { RoomInit, RoomPlayUrl } from '../services/interface';

/* state */
type RSelector = Pick<BilibiliLiveInitialState, 'bilibiliLiveList' | 'liveChildList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 直播间列表
  bilibiliLiveList: createSelector(
    ({ bilibiliLive }: { bilibiliLive: BilibiliLiveInitialState }): Array<LiveItem> => {
      return bilibiliLive.bilibiliLiveList;
    },
    (data: Array<LiveItem>): Array<LiveItem> => data
  ),
  // 直播下载
  liveChildList: createSelector(
    ({ bilibiliLive }: { bilibiliLive: BilibiliLiveInitialState }): Array<WebWorkerChildItem> => {
      return bilibiliLive.liveChildList;
    },
    (data: Array<WebWorkerChildItem>): Array<WebWorkerChildItem> => data
  )
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { bilibiliLiveList, liveChildList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 停止
  function handleStopClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveChildList, { id: record.id });

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const time: string = moment().format('YYYY_MM_DD_HH_mm_ss');
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `[B站直播]${ record.roomId }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);
      const resPlayUrl: RoomPlayUrl = await requestRoomPlayerUrl(`${ resInit.data.room_id }`);
      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

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
        const idx: number = findIndex(liveChildList, { id: record.id });

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Button type="primary"
                  danger={ true }
                  onClick={ (event: MouseEvent<HTMLButtonElement> ): void => handleStopClick(record, event) }
                >
                  停止录制
                </Button>
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