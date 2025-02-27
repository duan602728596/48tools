import type { SaveDialogReturnValue } from 'electron';
import { useEffect, type ReactElement, type MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Table, App, Popconfirm, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { useAppProps } from 'antd/es/app/context';
import { requestXiaohongshuLiveStream, type InitialState, type PullConfig, type PullConfigStreamInfo } from '@48tools-api/xiaohongshu';
import { showSaveDialog } from '../../utils/remote/dialog';
import Header from '../../components/Header/Header';
import AddLiveRoomForm from '../../components/AddLiveRoomForm/AddLiveRoomForm';
import Content from '../../components/Content/Content';
import HelpButtonGroup from '../../components/HelpButtonGroup/HelpButtonGroup';
import {
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  setRemoveWorkerItem,
  setAddWorkerItem,
  selectorsObject
} from './reducers/xiaohongshuLive';
import dbConfig from '../../utils/IDB/IDBConfig';
import { parseXiaohongshuLive } from './utils/parseXiaohongshuLive';
import { getFFmpeg, getFilePath } from '../../utils/utils';
import getFFmpegDownloadWorker from '../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import type { LiveItem, MessageEventData, WebWorkerChildItem } from '../../commonTypes';
import type { LiveSliceInitialState, LiveSliceSelector } from '../../store/slice/LiveSlice';

/* redux selector */
type RState = { xiaohongshuLive: LiveSliceInitialState };

const selector: Selector<RState, LiveSliceSelector> = createStructuredSelector({ ...selectorsObject });

/* 小红书直播录制 */
function Index(props: {}): ReactElement {
  const { liveList, workerList }: LiveSliceSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = workerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      workerList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent): Promise<void> {
    try {
      const res: string = await requestXiaohongshuLiveStream(record.roomId);
      const initialState: InitialState | undefined = parseXiaohongshuLive(res);

      if (!initialState) {
        messageApi.error('没有获取到小红书直播间信息！');

        return;
      }

      if (initialState.liveStream.liveStatus !== 'success') {
        messageApi.warning('当前直播未开始。');

        return;
      }

      const pullConfig: PullConfig = JSON.parse(initialState.liveStream.roomData.roomInfo.pullConfig);
      const h264: Array<PullConfigStreamInfo> = pullConfig.h264;
      const liveUrl: string = (h264[1] ?? h264[0]).master_url;
      const isM3u8: boolean = /\.m3u8$/.test(liveUrl);

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: '小红书直播',
          infoArray: [record.roomId, record.description, initialState.liveStream.roomData.roomInfo.roomTitle],
          ext: /\.m3u8$/.test(liveUrl) ? 'ts' : 'flv'
        })
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(e: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = e.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi && messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setRemoveWorkerItem(record.id));
        }
      });

      worker.postMessage({
        type: 'start',
        playStreamPath: liveUrl,
        filePath: result.filePath,
        id: record.id,
        ffmpeg: getFFmpeg(),
        protocolWhitelist: isM3u8
      });

      dispatch(setAddWorkerItem({
        id: record.id,
        worker
      }));
    } catch (err) {
      messageApi.error('获取小红书直播间信息失败！');
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
        const idx: number = workerList.findIndex((o: WebWorkerChildItem) => o.id === record.id);

        return (
          <Space.Compact>
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
          </Space.Compact>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(IDBCursorLiveList({
      query: { indexName: dbConfig.objectStore[10].data[1] }
    }));
  }, []);

  return (
    <Content>
      <Header>
        <HelpButtonGroup navId="xiaohongshu-live" tooltipTitle="如何添加小红书的直播间ID">
          <AddLiveRoomForm modalTitle="添加小红书直播间信息" IDBSaveDataFunc={ IDBSaveLiveItem } />
        </HelpButtonGroup>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[10].key }
        pagination={{
          showQuickJumper: true
        }}
      />
    </Content>
  );
}

export default Index;