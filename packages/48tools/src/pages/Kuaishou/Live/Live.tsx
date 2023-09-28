import type { SaveDialogReturnValue } from 'electron';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, message, Popconfirm, Table } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { ColumnsType } from 'antd/es/table';
import { showSaveDialog } from '../../../utils/remote/dialog';
import Header from '../../../components/Header/Header';
import AddLiveRoomForm from '../../../components/AddLiveRoomForm/AddLiveRoomForm';
import {
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  setAddWorkerItem,
  setRemoveWorkerItem,
  selectorsObject
} from '../reducers/kuaishouLive';
import dbConfig from '../../../utils/IDB/IDBConfig';
import getLiveInfo from './function/getLiveInfo';
import { getFFmpeg, getFileTime } from '../../../utils/utils';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import type { LiveSliceInitialState, LiveSliceSelectorNoAutoRecordTimer } from '../../../store/slice/LiveSlice';
import type { WebWorkerChildItem, LiveItem, MessageEventData } from '../../../commonTypes';
import type { LiveInfo, PlayUrlItem } from '../types';

/* redux selector */
type RState = { kuaishouLive: LiveSliceInitialState };

const selector: Selector<RState, LiveSliceSelectorNoAutoRecordTimer> = createStructuredSelector({ ...selectorsObject });

/* 快手直播 */
function Live(props: {}): ReactElement {
  const { workerList: kuaishouLiveWorkerList, liveList: kuaishouLiveList }: LiveSliceSelectorNoAutoRecordTimer = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 录制直播
  async function handleRecordClick(record: LiveItem, event: MouseEvent): Promise<void> {
    try {
      const liveInfo: LiveInfo | undefined = await getLiveInfo(record.roomId);
      const playUrlItem: PlayUrlItem | undefined = liveInfo?.list?.at?.(-1);

      if (!liveInfo || !playUrlItem) {
        messageApi.warning('直播未开启！');

        return;
      }

      const time: string = getFileTime();
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[快手直播]${ record.roomId }_${ playUrlItem.qualityType }_${ liveInfo.title }_${ time }.flv`
      });

      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = messageEvent.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`快手直播[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setRemoveWorkerItem(record.id));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: playUrlItem.url,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddWorkerItem({
        id: record.id,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('快手直播录制失败！');
    }
  }

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = kuaishouLiveWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      kuaishouLiveWorkerList[index].worker.postMessage({ type: 'stop' });
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
      title: '操作',
      key: 'handle',
      width: 175,
      render: (value: undefined, record: LiveItem, index: number): ReactElement => {
        const idx: number = kuaishouLiveWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止录制吗？"
                  onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止录制</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent): Promise<void> => handleRecordClick(record, event) }>
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
    dispatch(IDBCursorLiveList({
      query: { indexName: dbConfig.objectStore[7].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <AddLiveRoomForm modalTitle="添加快手直播间信息"
          customRoomIdRule={ [{ required: true, message: '请填写直播间ID', whitespace: true }] }
          IDBSaveDataFunc={ IDBSaveLiveItem }
        />
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ kuaishouLiveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[7].key }
        pagination={{
          showQuickJumper: true
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Live;