import type { SaveDialogReturnValue } from 'electron';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Alert, Table, App, Popconfirm, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { useAppProps } from 'antd/es/app/context';
import { requestStreamingUrl, type StreamingUrl, type StreamingUrlItem } from '@48tools-api/showroom';
import { showSaveDialog } from '../../utils/remote/dialog';
import Header from '../../components/Header/Header';
import AddLiveRoomForm from '../../components/AddLiveRoomForm/AddLiveRoomForm';
import Content from '../../components/Content/Content';
import dbConfig from '../../utils/IDB/IDBConfig';
import {
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  setAddWorkerItem,
  setRemoveWorkerItem,
  selectorsObject
} from './reducers/showroomLive';
import ShowroomTextIcon from '../Index/ShowroomTextIcon/ShowroomTextIcon';
import { getFFmpeg, getFilePath } from '../../utils/utils';
import getFFmpegDownloadWorker from '../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import type { LiveSliceInitialState, LiveSliceSelector } from '../../store/slice/LiveSlice';
import type { LiveItem, MessageEventData, WebWorkerChildItem } from '../../commonTypes';

/* redux selector */
type RState = { showroomLive: LiveSliceInitialState };

const selector: Selector<RState, LiveSliceSelector> = createStructuredSelector({ ...selectorsObject });

/* showroom直播抓取 */
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
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: getFilePath({
        typeTitle: 'showroom-live',
        infoArray: [record.roomId, record.description],
        ext: 'ts'
      })
    });

    if (result.canceled || !result.filePath) return;

    const res: StreamingUrl = await requestStreamingUrl(record.roomId);

    if (!res?.streaming_url_list?.length) {
      messageApi.error('获取直播地址失败！');

      return;
    }

    res.streaming_url_list.sort((a: StreamingUrlItem, b: StreamingUrlItem): number => ((b.quality || 0) - (a.quality || 0)));

    const worker: Worker = getFFmpegDownloadWorker();

    worker.addEventListener('message', function(e: MessageEvent<MessageEventData>) {
      const { type, error }: MessageEventData = e.data;

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
      playStreamPath: res.streaming_url_list[0].url,
      filePath: result.filePath,
      id: record.id,
      ffmpeg: getFFmpeg(),
      protocolWhitelist: true
    });

    dispatch(setAddWorkerItem({
      id: record.id,
      worker
    }));
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
    dispatch(IDBCursorLiveList({
      query: { indexName: dbConfig.objectStore[9].data[1] }
    }));
  }, []);

  return (
    <Content>
      <Header>
        <AddLiveRoomForm modalTitle={
          <Fragment>
            添加
            <span className="font-normal">{ ShowroomTextIcon }</span>
            直播间信息
          </Fragment>
        } IDBSaveDataFunc={ IDBSaveLiveItem } />
      </Header>
      <Alert className="mb-[8px]" type="warning" message="录制时需要开启VPN，使用Tun（虚拟网卡）模式代理最佳。" />
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[9].key }
        pagination={{
          showQuickJumper: true
        }}
      />
    </Content>
  );
}

export default Index;