import { ipcRenderer, remote, SaveDialogReturnValue } from 'electron';
import { Fragment, ReactElement, useEffect, MouseEvent } from 'react';
import type { Store, Dispatch } from 'redux';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash';
import * as moment from 'moment';
import BilibiliLiveWorker from 'worker-loader!./bilibiliLive.worker';
import style from '../../48/index.sass';
import AddForm from './AddForm';
import { cursorFormData, deleteFormData, setLiveBilibiliChildList, BilibiliInitialState, LiveChildItem } from '../reducers/reducers';
import dbConfig from '../../../utils/idb/dbConfig';
import { requestRoomInitData, requestRoomPlayerUrl } from '../services/live';
import { getFFmpeg } from '../../../utils/utils';
import type { LiveItem } from '../types';
import type { RoomInit, RoomPlayUrl } from '../interface';

/* state */
type RSelector = Pick<BilibiliInitialState, 'bilibiliLiveList' | 'liveChildList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 直播间列表
  bilibiliLiveList: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): Array<LiveItem> => bilibili.bilibiliLiveList,
    (data: Array<LiveItem>): Array<LiveItem> => data
  ),
  // 直播下载
  liveChildList: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): Array<LiveChildItem> => bilibili.liveChildList,
    (data: Array<LiveChildItem>): Array<LiveChildItem> => data
  )
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { bilibiliLiveList, liveChildList }: RSelector = useSelector(state);
  const store: Store = useStore();
  const dispatch: Dispatch = useDispatch();

  // 停止
  function handleStopClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveChildList, { id: record.id });

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 停止后的回调函数
  function endCallback(record: LiveItem): void {
    const list: Array<LiveChildItem> = [...store.getState().bilibili.liveChildList];
    const index: number = findIndex(list, { id: record.id });

    if (index >= 0) {
      list.splice(index, 1);
      dispatch(setLiveBilibiliChildList([...list]));
    }
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const time: string = moment().format('YYYY_MM_DD_HH_mm_ss');
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `${ record.roomId }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);
      const resPlayUrl: RoomPlayUrl = await requestRoomPlayerUrl(`${ resInit.data.room_id }`);
      const worker: Worker = new BilibiliLiveWorker();

      type EventData = {
        type: 'close' | 'error';
        error?: Error;
      };

      worker.addEventListener('message', function(event: MessageEvent<EventData>) {
        const { type, error }: EventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          endCallback(record);
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resPlayUrl.data.durl[0].url,
        filePath: result.filePath,
        id: record.id,
        ffmpeg: getFFmpeg()
      });

      dispatch(setLiveBilibiliChildList(
        liveChildList.concat([{
          id: record.id,
          worker
        }])
      ));
    } catch (err) {
      console.error(err);
      message.error('录制失败！');
    }
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(deleteFormData({
      query: record.id
    }));
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
    {
      title: '操作',
      key: 'handle',
      width: 155,
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
    dispatch(cursorFormData({
      query: { indexName: dbConfig.objectStore[0].data[1] }
    }));
  }, []);

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